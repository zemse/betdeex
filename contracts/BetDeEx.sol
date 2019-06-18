pragma solidity ^0.5.9;

import "https://raw.githubusercontent.com/zemse/betdeex/master/contracts/ESContract.sol";

contract BetDeEx {
    address[] public bets; // stores addresses of bets
    address public superManager; //required to be public because ES needs to be sent transaparently.

    EraswapToken esTokenContract;

    mapping(address => uint256) public betBalanceInExaEs; // all ES tokens are transfered to main BetDeEx address for common allowance in ERC20 so this mapping stores total ES tokens betted in each bet.
    mapping(address => bool) public isBetValid; // stores authentic bet contracts (only deployed through this contract)
    mapping(address => bool) public isManager; // stores addresses who are given manager privileges by superManager

    event NewBetContract (
        address indexed _deployer,
        address _contractAddress,
        uint8 indexed _category,
        uint8 indexed _subCategory,
        string _description
    );

    event NewBetting (
        address indexed _betAddress,
        address indexed _bettorAddress,
        uint8 indexed _choice,
        uint256 _bettorIndex
    );

    event EndBetContract (
        address indexed _ender,
        address indexed _contractAddress,
        uint8 _result,
        uint256 _prizePool,
        uint256 _platformFee
    );

    modifier onlySuperManager() {
        require(msg.sender == superManager);
        _;
    }

    modifier onlyManager() {
        require(isManager[msg.sender]);
        _;
    }

    modifier onlyBetContract() {
        require(isBetValid[msg.sender]);
        _;
    }

    constructor(address _esTokenContractAddress) public {
        superManager = msg.sender;
        isManager[msg.sender] = true;
        esTokenContract = EraswapToken(_esTokenContractAddress);
    }


    // bet functions

    // This method can only be called by manager to deploy a new bet. 
    function createBet(
        string memory _description,
        uint8 _category,
        uint8 _subCategory,
        uint256 _minimumBet,
        uint256 _pricePercent,
        bool _isDrawPossible,
        uint256 _pauseBlockNumber // bet will be open for betting until this block, after this block numberexceeds any user will not be able to place bet. and manager can only end bet after this time
    ) public onlyManager returns (address) {
        Bet _newBet = new Bet(_description, _category, _subCategory, _minimumBet, _pricePercent, _isDrawPossible, _pauseBlockNumber);
        bets.push(address(_newBet));
        isBetValid[address(_newBet)] = true;

        // emitting an event for UI to get latest bets.
        emit NewBetContract(msg.sender, address(_newBet),  _category, _subCategory, _description);

        return address(_newBet);
    }
    
    function getNumberOfBets() public view returns (uint256) {
        return bets.length;
    }

    





    // manager crud - only would be called by superManager

    function addManager(address _manager) public onlySuperManager {
        isManager[_manager] = true;
    }

    function removeManager(address _manager) public onlySuperManager {
        isManager[_manager] = false;
    }




    // this is an internal functionality only for bet contracts to add balance when someone enters a bet. This is because actual ES tokens are stored in BetDeEx contract
    function addAmountToBet(uint256 _betAmountInExaEs) public onlyBetContract returns (bool) {
        betBalanceInExaEs[msg.sender] += _betAmountInExaEs;
        return true;
    }

    // this functionality is only for bet contracts to emit a event when a new bet is placed so that front end can get the information by subscribing to  contract
    function emitNewBettingEvent(address _bettorAddress, uint8 _choice, uint256 _bettorIndex) public onlyBetContract {
        emit NewBetting(msg.sender, _bettorAddress, _choice, _bettorIndex);
    }

    // this functionality is only for bet contracts to emit event when a bet is ended so that front end can get the information by subscribing to  contract
    function emitEndEvent(address _ender, uint8 _result, uint256 _gasFee) public onlyBetContract {
        emit EndBetContract(_ender, msg.sender, _result, betBalanceInExaEs[msg.sender], _gasFee);
    }





    // esTokenContract functions that will be called from bet contracts to transfer tokens
    
    // this method checks spending allowance of the BetDeEx contract from user's account
    function getBettorBalance(address _from) public view returns (uint256) {
        return esTokenContract.allowance(_from, address(this));
    }

    // this method is used to transfer tokens from user's account to BetDeEx's address
    function collectBettorTokens(address _from, uint256 _betTokensInExaEs) public onlyBetContract returns (bool) {
        require(esTokenContract.transferFrom(_from, address(this), _betTokensInExaEs));
        betBalanceInExaEs[msg.sender] += _betTokensInExaEs;
        return true;
    }

    // this method is used to transfer prizes to winners
    function sendTokensToAddress(address _to, uint256 _tokensInExaEs) public onlyBetContract returns (bool) {
        require(esTokenContract.transfer(_to, _tokensInExaEs));
        betBalanceInExaEs[msg.sender] -= _tokensInExaEs;
    }

}

contract Bet {
    using SafeMath for uint256;

    struct Bettor {
        address bettorAddress;
        uint256 betAmountInExaEs;
    }

    BetDeEx betDeEx;

    string public description; // question text of the bet
    bool isDrawPossible; // if false then user cannot bet on draw choice
    uint8 public category; // sports, movies
    uint8 public subCategory; // cricket, football

    uint8 public finalResult; // given a value when manager ends bet
    address public endedBy; // address of manager who enters the correct choice while ending the bet

    uint256 public creationBlockNumber; // (predefined)
    uint256 public pauseBlockNumber; // (predefined) after this no more bettings are not allowed by users
    uint256 public endBlockNumber; // (defined when manager ends bet)

    uint256 public minimumBetInExaEs; // minimum amount required to enter bet
    uint256 public pricePercentPerThousand; // percentage of bet balance which will be dristributed to winners and rest is platform fee
    uint256[3] public totalBetTokensInExaEsByChoice = [0, 0, 0]; // array of total bet value of no, yes, draw voters

    // stores bettor details by choice
    Bettor[] public noBettors;
    Bettor[] public yesBettors;
    Bettor[] public drawBettors;

    modifier onlyManager() {
        require(betDeEx.isManager(msg.sender));
        _;
    }

    // _pricePercentPerThousand is an integer from 0 to 1000. if we want to keep .2% then its value is 998. if 2% then value is 980
    constructor(string memory _description, uint8 _category, uint8 _subCategory, uint256 _minimumBetInExaEs, uint256 _pricePercentPerThousand, bool _isDrawPossible, uint256 _pauseBlockNumber) public {
        description = _description;
        isDrawPossible = _isDrawPossible;
        category = _category;
        subCategory = _subCategory;
        minimumBetInExaEs = _minimumBetInExaEs;
        pricePercentPerThousand = _pricePercentPerThousand;
        betDeEx = BetDeEx(msg.sender);
        creationBlockNumber = block.number;
        pauseBlockNumber = _pauseBlockNumber;
    }

    function betBalanceInExaEs() public view returns (uint256) {
        return betDeEx.betBalanceInExaEs(address(this));
    }

    // _choice should be 0, 1, 2; no => 0, yes => 1, draw => 2.
    function enterBet(uint8 _choice, uint256 _betTokensInExaEs) public {
        require(block.number <= pauseBlockNumber);
        require(_betTokensInExaEs >= minimumBetInExaEs);
        require(betDeEx.getBettorBalance(msg.sender) >= _betTokensInExaEs);
        uint256 _arrayIndex;
        if (_choice == 0) {
            totalBetTokensInExaEsByChoice[0] += _betTokensInExaEs;
            _arrayIndex = noBettors.length;
            noBettors.push(Bettor({
                bettorAddress: msg.sender,
                betAmountInExaEs: _betTokensInExaEs
            }));
        } else if (_choice == 1) {
            totalBetTokensInExaEsByChoice[1] += _betTokensInExaEs;
            _arrayIndex = yesBettors.length;
            yesBettors.push(Bettor({
                bettorAddress: msg.sender,
                betAmountInExaEs: _betTokensInExaEs
            }));
        } else if (_choice == 2 && isDrawPossible) {
            totalBetTokensInExaEsByChoice[2] += _betTokensInExaEs;
            _arrayIndex = drawBettors.length;
            drawBettors.push(Bettor({
                bettorAddress: msg.sender,
                betAmountInExaEs: _betTokensInExaEs
            }));
        } else {
            require(false);
        }

        // betDeEx contract transfers the tokens to it self
        require(betDeEx.collectBettorTokens(msg.sender, _betTokensInExaEs));

        //emit NewBetting(msg.sender, _betTokensInExaEs, _choice, _arrayIndex);
        betDeEx.emitNewBettingEvent(msg.sender, _choice, _arrayIndex);
    }

    // this method is used by manager to give correct answer and transfer prize to winners
    function endBet(uint8 _choice) public onlyManager {
        require(block.number >= pauseBlockNumber);

        // because its required to initialise the pointer with something.
        Bettor[] storage _winnerBettors = noBettors;
        if (_choice == 1) {
            _winnerBettors = yesBettors;
        } else if (_choice == 2) {
            require(isDrawPossible);
            _winnerBettors = drawBettors;
        } else if (_choice > 2) {
            require(false);
        }

        // the platform fee is excluded from entire bet balance and this is the amount to be distributed
        uint256 totalPrize = betBalanceInExaEs().mul(pricePercentPerThousand).div(1000);

        // sending the platform fee excluded amount to the winners
        for(uint256 i = 0; i < _winnerBettors.length; i++) {
            if(_winnerBettors[i].bettorAddress != address(0)) {
                betDeEx.sendTokensToAddress(
                    _winnerBettors[i].bettorAddress,
                    _winnerBettors[i].betAmountInExaEs.mul(totalPrize).div(totalBetTokensInExaEsByChoice[_choice])
                );
            }
        }

        // this is the left platform fee according to the totalPrize variable above
        uint256 _platformFee = betBalanceInExaEs();

        endedBy = msg.sender;
        
        // sending plaftrom fee to the super manager
        betDeEx.sendTokensToAddress(betDeEx.superManager(), _platformFee);

        endBlockNumber = block.number;
        finalResult = _choice;
        betDeEx.emitEndEvent(endedBy, _choice, _platformFee);
    }

    // get number of bettors on this bet by choice 
    function getNumberOfChoiceBettors(uint8 _choice) public view returns (uint256) {
        if (_choice == 0) {
            return noBettors.length;
        } else if (_choice == 1) {
            return yesBettors.length;
        } else {
            return drawBettors.length;
        }
    }

}
