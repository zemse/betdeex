var provider;

isMetamaskRunning = false;

if (window.ethereum) {
  window.web3 = new Web3(ethereum);
  try {
    ethereum.enable();
  } catch (error) {
    // User denied account access...
    console.log('user denied access');
  }
} else if (typeof window.web3 !== 'undefined') {
	provider = web3.currentProvider;
	console.log('current provider selected');
  isMetamaskRunning = true;
} else {
	console.log('Install metamask');
  provider = new Web3.providers.HttpProvider(
   'https://rinkeby.infura.io/d64e4d75857d4bbe8e196ca93328c4b7'
  )
  console.log('Provider self configured', provider);
}
const web3 = new Web3(provider);
console.log('web3 object', web3);
//console.log(esContractAbi);
const esContract = new web3.eth.Contract(esContractAbi, '3beb087e33ec0b830325991a32e3f8bb16a51317');
const betdeex = new web3.eth.Contract(betdeexAbi, 'c4cfb05119ea1f59fb5a8f949288801491d00110');

console.log('esContract object', esContract);
console.log('betdeex object', betdeex);

var userAccount;
(async () => {
  const accounts = await web3.eth.getAccounts();
  userAccount = accounts[0];
  console.log('user account addr', userAccount);
})();

var numberOfBets;

const createBetBox = (_description, _category, _betAddress) => {
  const newBetBox = document.getElementsByClassName('betboxtheme')[0].cloneNode(true);
  newBetBox.removeAttribute('style');
  newBetBox.children[0].children[0].children[0].children[0].children[1].innerHTML = _category;
  newBetBox.children[0].children[1].innerHTML = _description;
  newBetBox.children[0].children[3].children[0].children[0].children[1].addEventListener('click', () => {
    //alert(_betAddress);
    betAddressInModal = _betAddress;
    betmodal.children[0].children[0].children[1].children[0].children[0].children[1].innerText = _description;
    betmodal.children[0].children[0].children[1].children[0].children[2].children[0].children[2].children[0].innerHTML = isMetamaskRunning ? 'Metamask found in browser and your address is' + userAccount : 'Please install <a href="https://chrome.google.com/webstore/detail/metamask/nkbihfbeogaeaoehlefnkodbefgpgknn?hl=en" target="_blank"><span style="color: #4caf50;">MetaMask</span> </a> chrome extention to place the bet.';
  });

  return newBetBox;//betlist.appendChild(newBetBox);
};

// multiple/nexted async await are written for efficient utilisation of time.
(async () => {
  numberOfBets = await betdeex.methods.getNumberOfBets().call();
  console.log('numberOfBets', numberOfBets);

  for(let i = 0; i < numberOfBets; i++) {
    (async() => {
      const betAddress = await betdeex.methods.bets(i).call();
      console.log(betAddress);
      const betInstance = new web3.eth.Contract(betAbi, betAddress);
      betlist.insertAdjacentElement(
        'beforeend',
        createBetBox(
          await betInstance.methods.description().call(),
          await betInstance.methods.category().call(),
          betAddress
        )
      );
    })();
  }

})();


var betAddressInModal; // declared for noting which bet user clicked

document.getElementById('modalSubmit').addEventListener(() => {
  // sign and send transaction.

});
