var category = 'Cricket';
var web3;
var provider;
var isMetamaskRunning = false;
var numberOfBets;
var betAddressInModal; // declared for noting which bet user clicked

const createBetBox = (_betAddress, _description, _category, _amount, _minimumBet, _pricePercentPerThousand, _timestamp) => {
  const newBetBox = document.getElementsByClassName('betboxtheme')[0].cloneNode(true);
  newBetBox.removeAttribute('style');
  newBetBox.children[0].children[0].children[0].children[0].children[1].innerHTML = _category;
  newBetBox.children[0].children[1].innerHTML = _description;
  newBetBox.children[0].children[3].children[0].children[0].children[0].children[0].children[1].children[0].innerText = _amount / 10**18 + ' ES';
  newBetBox.children[0].children[3].children[0].children[0].children[0].children[1].children[1].children[0].innerText = _minimumBet / 10**18 + ' ES';
  newBetBox.children[0].children[3].children[0].children[0].children[0].children[2].children[1].children[0].innerText = (1000 - _pricePercentPerThousand) / 10;
  newBetBox.children[0].children[3].children[0].children[0].children[0].children[3].children[1].innerText = new Date(_timestamp * 1000).toGMTString();
  newBetBox.children[0].children[3].children[0].children[0].children[0].children[3].children[2].innerText = new Date(_timestamp * 1000).toLocaleString() + ' (in your local timezone)';
  newBetBox.children[0].children[3].children[0].children[0].children[1].addEventListener('click', () => {
    //alert(_betAddress);
    betAddressInModal = _betAddress;
    betmodal.children[0].children[0].children[1].children[0].children[0].children[1].innerText = _description;
    betmodal.children[0].children[0].children[1].children[0].children[2].children[0].children[2].children[0].innerHTML = isMetamaskRunning ? 'Metamask found in browser and your address is' + userAccount : 'Please install <a href="https://chrome.google.com/webstore/detail/metamask/nkbihfbeogaeaoehlefnkodbefgpgknn?hl=en" target="_blank"><span style="color: #4caf50;">MetaMask</span> </a> chrome extention to place the bet.';
  });

  return newBetBox;//betlist.appendChild(newBetBox);
};

// multiple/nexted async await are written for efficient utilisation of time.
window.addEventListener('load', async () => {
  // new version of metamask
  if (window.ethereum) {
    try {
      await ethereum.enable();
      provider = ethereum;
      isMetamaskRunning = true;
    } catch (error) {
      console.log('user denied metamask access');
    }
  }
  // old version of metamask
  else if (window.web3) {
    provider = web3.currentProvider;
  	console.log('current provider selected');
    isMetamaskRunning = true;
  }
  // no metamask using a rinkeby node
  else {
    provider = new Web3.providers.HttpProvider(
     'https://rinkeby.infura.io/d64e4d75857d4bbe8e196ca93328c4b7'
    );
    console.log('Non-Ethereum browser detected. User should consider installing MetaMask!');
  }


  web3 = new Web3(provider);
  console.log('web3 object created', web3);
  //console.log(esContractAbi);
  const esContract = new web3.eth.Contract(esContractAbi, '3beb087e33ec0b830325991a32e3f8bb16a51317');
  const betdeex = new web3.eth.Contract(betdeexAbi, 'ca4d0578c5e07f0964c7e7ccc87e606a234625b8');

  console.log('esContract object', esContract);
  console.log('betdeex object', betdeex);

  var userAccount;
  (async () => {
    const accounts = await web3.eth.getAccounts();
    userAccount = accounts[0];
    console.log('user account addr', userAccount);
  })();

  (async () => {
    numberOfBets = await betdeex.methods.getNumberOfBets().call();
    console.log('numberOfBets', numberOfBets);

    // for(let i = 0; i < numberOfBets; i++) {
    //   (async() => {
    //     const betAddress = await betdeex.methods.bets(i).call();
    //     console.log(betAddress);
    //     const betInstance = new web3.eth.Contract(betAbi, betAddress);
    //     betlist.insertAdjacentElement(
    //       'beforeend',
    //       createBetBox(
    //         betAddress,
    //         await betInstance.methods.description().call(),
    //         await betInstance.methods.category().call(),
    //         await betdeex.methods.betBalanceInExaEs(betAddress).call(),
    //         await betInstance.methods.minimumBetInExaEs().call(),
    //         await betInstance.methods.pricePercentPerThousand().call()
    //       )
    //     );
    //   })();
    // }

    const events = await betdeex.getPastEvents('NewBetContract', {
      fromBlock: 1
    });

    console.log('events', events);

    for(let ev of events) {
      // if(ev.returnValues[3] != category) {
      //   continue;
      // }
      (async() => {
        const betAddress = ev.returnValues[1];
        const block = await web3.eth.getBlock(ev.blockNumber);
        //console.log('timestamp', block.timestamp);
        console.log('bet address', betAddress);
        const betInstance = new web3.eth.Contract(betAbi, betAddress);
        betlist.insertAdjacentElement(
          'beforeend',
          createBetBox(
            betAddress,
            await betInstance.methods.description().call(),
            await betInstance.methods.category().call(),
            await betdeex.methods.betBalanceInExaEs(betAddress).call(),
            await betInstance.methods.minimumBetInExaEs().call(),
            await betInstance.methods.pricePercentPerThousand().call(),
            block.timestamp
          )
        );
      })();
    }

  })();




});




document.getElementById('modalSubmit').addEventListener('click', () => {
  // sign and send transaction.

});
