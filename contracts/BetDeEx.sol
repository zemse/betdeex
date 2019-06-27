pragma solidity ^0.5.9;

import "https://raw.githubusercontent.com/zemse/betdeex/master/contracts/ESContract.sol";

contract BetDeEx {
    using SafeMath for uint256;

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
        uint256 _betTokensInExaEs
    );

    event EndBetContract (
        address indexed _ender,
        address indexed _contractAddress,
        uint8 _result,
        uint256 _prizePool,
        uint256 _platformFee
    );

    // This event is for indexing ES transactions to winner bettors from this contract
    event TransferES (
        address indexed _betContract,
        address indexed _to,
        uint256 _tokensInExaEs
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
        uint256 _pauseTimestamp // bet will be open for betting until this timestamp, after this timestamp, any user will not be able to place bet. and manager can only end bet after this time
    ) public onlyManager returns (address) {
        Bet _newBet = new Bet(_description, _category, _subCategory, _minimumBet, _pricePercent, _isDrawPossible, _pauseTimestamp);
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





    // this functionality is only for bet contracts to emit a event when a new bet is placed so that front end can get the information by subscribing to  contract
    function emitNewBettingEvent(address _bettorAddress, uint8 _choice, uint256 _betTokensInExaEs) public onlyBetContract {
        emit NewBetting(msg.sender, _bettorAddress, _choice, _betTokensInExaEs);
    }

    // this functionality is only for bet contracts to emit event when a bet is ended so that front end can get the information by subscribing to  contract
    function emitEndEvent(address _ender, uint8 _result, uint256 _gasFee) public onlyBetContract {
        emit EndBetContract(_ender, msg.sender, _result, betBalanceInExaEs[msg.sender], _gasFee);
    }





    // esTokenContract functions that will be called from bet contracts to transfer tokens

    // this method is used to transfer tokens from bettor wallet to bet
    function collectBettorTokens(address _from, uint256 _betTokensInExaEs) public onlyBetContract returns (bool) {
        require(esTokenContract.transferFrom(_from, address(this), _betTokensInExaEs));
        betBalanceInExaEs[msg.sender] = betBalanceInExaEs[msg.sender].add(_betTokensInExaEs);
        return true;
    }


    // this method is used to transfer prizes to winners
    function sendTokensToAddress(address _to, uint256 _tokensInExaEs) public onlyBetContract returns (bool) {
        betBalanceInExaEs[msg.sender] = betBalanceInExaEs[msg.sender].sub(_tokensInExaEs);
        require(esTokenContract.transfer(_to, _tokensInExaEs));

        emit TransferES(msg.sender, _to, _tokensInExaEs);
        return true;
    }

    function collectPlatformFee(uint256 _platformFee) public onlyBetContract returns (bool) {
        require(esTokenContract.transfer(superManager, _platformFee));
        return true;
    }

}

contract Bet {
    using SafeMath for uint256;

    // struct Bettor {
    //     uint256[3] betAmountInExaEsByChoice; // Bettor can bet on multiple choices
    // }

    BetDeEx betDeEx;

    string public description; // question text of the bet
    bool public isDrawPossible; // if false then user cannot bet on draw choice
    uint8 public category; // sports, movies
    uint8 public subCategory; // cricket, football

    uint8 public finalResult; // given a value when manager ends bet
    address public endedBy; // address of manager who enters the correct choice while ending the bet

    uint256 public creationTimestamp; // set during bet creation
    uint256 public pauseTimestamp; // set as an argument by deployer
    uint256 public endTimestamp; // set when a manager ends bet and prizes are distributed

    uint256 public minimumBetInExaEs; // minimum amount required to enter bet
    uint256 public pricePercentPerThousand; // percentage of bet balance which will be dristributed to winners and rest is platform fee
    uint256[3] public totalBetTokensInExaEsByChoice = [0, 0, 0]; // array of total bet value of no, yes, draw voters
    uint256[3] public getNumberOfChoiceBettors = [0, 0, 0]; // stores number of bettors in a choice

    uint256 public totalPrize; // this is the prize (platform fee is already excluded)

    //mapping(address => Bettor) betAmountInExaEsByChoice; // mapps addresses to betAmount and choice
    mapping(address => uint256[3]) bettorBetAmountInExaEsByChoice; // mapps addresses to array of betAmount by choice
    mapping(address => bool) bettorHasClaimed; // set to true when bettor claims the prize

    modifier onlyManager() {
        require(betDeEx.isManager(msg.sender));
        _;
    }

    // _pricePercentPerThousand is an integer from 0 to 1000. if we want to keep .2% then its value is 998. if 2% then value is 980
    constructor(string memory _description, uint8 _category, uint8 _subCategory, uint256 _minimumBetInExaEs, uint256 _pricePercentPerThousand, bool _isDrawPossible, uint256 _pauseTimestamp) public {
        description = _description;
        isDrawPossible = _isDrawPossible;
        category = _category;
        subCategory = _subCategory;
        minimumBetInExaEs = _minimumBetInExaEs;
        pricePercentPerThousand = _pricePercentPerThousand;
        betDeEx = BetDeEx(msg.sender);
        creationTimestamp = now;
        pauseTimestamp = _pauseTimestamp;
    }

    function betBalanceInExaEs() public view returns (uint256) {
        return betDeEx.betBalanceInExaEs(address(this));
    }

    // _choice should be 0, 1, 2; no => 0, yes => 1, draw => 2.
    function enterBet(uint8 _choice, uint256 _betTokensInExaEs) public {
        require(now < pauseTimestamp);
        require(_betTokensInExaEs >= minimumBetInExaEs);

        // betDeEx contract transfers the tokens to it self
        require(betDeEx.collectBettorTokens(msg.sender, _betTokensInExaEs));

        if (_choice > 2 || (_choice == 2 && !isDrawPossible) ) {
            require(false);
        }

        getNumberOfChoiceBettors[_choice] = getNumberOfChoiceBettors[_choice].add(1);
        totalBetTokensInExaEsByChoice[_choice] = totalBetTokensInExaEsByChoice[_choice].add(_betTokensInExaEs);
        // bettorDetails[msg.sender] = Bettor({
        //     betAmountInExaEs: _betTokensInExaEs,
        //     choice: _choice
        // });

        bettorBetAmountInExaEsByChoice[msg.sender][_choice] = bettorBetAmountInExaEsByChoice[msg.sender][_choice].add(_betTokensInExaEs);

        betDeEx.emitNewBettingEvent(msg.sender, _choice, _betTokensInExaEs);
    }

    function getContractTime() public view returns(uint256){
        return now;
    }

    // this method is used by manager to give correct answer and transfer prize to winners
    function endBet(uint8 _choice) public onlyManager {
        require(now >= pauseTimestamp);
        require(endedBy == address(0), "Bet Already Ended");

        if(_choice < 2  || (_choice == 2 && isDrawPossible)) {
            finalResult = _choice;
        } else {
            require(false);
        }

        endedBy = msg.sender;
        endTimestamp = now;


        // the platform fee is excluded from entire bet balance and this is the amount to be distributed
        totalPrize = betBalanceInExaEs().mul(pricePercentPerThousand).div(1000);

        // this is the left platform fee according to the totalPrize variable above
        uint256 _platformFee = betBalanceInExaEs().sub(totalPrize);

        // sending plaftrom fee to the super manager
        require(betDeEx.collectPlatformFee(_platformFee));

        betDeEx.emitEndEvent(endedBy, _choice, _platformFee);
    }

    // this can be called by anyone to see how much winners are getting
    function seeWinnerPrize(address _bettorAddress) public view returns (uint256) {
        require(endTimestamp > 0);
        //require(bettorBetAmountInExaEsByChoice[_bettorAddress][finalResult] > 0);

        return bettorBetAmountInExaEsByChoice[_bettorAddress][finalResult].mul(totalPrize).div(totalBetTokensInExaEsByChoice[finalResult]);
    }

    // will be called after bet ends and winner bettors can withdraw their prize share
    function withdrawPrize() public {
        require(endTimestamp > 0);
        require(!bettorHasClaimed[msg.sender]);
        require(bettorBetAmountInExaEsByChoice[msg.sender][finalResult] > minimumBetInExaEs); // to keep out option 0
        uint256 _winningAmount = bettorBetAmountInExaEsByChoice[msg.sender][finalResult].mul(totalPrize).div(totalBetTokensInExaEsByChoice[finalResult]);
        bettorHasClaimed[msg.sender] = true;
        betDeEx.sendTokensToAddress(
            msg.sender,
            _winningAmount
        );
    }

    function getBettorBetAmountInExaEsByChoice(uint8 _choice) public view returns (uint256) {
        return bettorBetAmountInExaEsByChoice[msg.sender][_choice];
    }
}
