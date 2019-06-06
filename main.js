var web3old = window.web3;
var web3;
var provider;
var userAccount;
var isMetamaskRunning = false;
var numberOfBets;
var betAddressInModal; // declared for noting which bet user clicked
var currentCategory, currentSubCategory, displayAllBets = true;
var esContract, betdeex;

const createBetBox = (_betAddress, _description, _category, _subCategory, _amount, _minimumBet, _pricePercentPerThousand, _timestamp) => {
  console.log('creating bet box'+_betAddress);
  const newBetBox = document.getElementsByClassName('betboxtheme')[0].cloneNode(true);
  newBetBox.removeAttribute('style');
  newBetBox.setAttribute('id', _betAddress);
  newBetBox.children[0].children[0].children[0].children[0].children[1].innerHTML = env.category[_category];
  newBetBox.children[0].children[0].children[0].children[0].children[3].innerHTML = env.subCategory[_category][_subCategory];
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
    betmodal.children[0].children[0].children[1].children[0].children[2].children[0].children[2].children[0].innerHTML = isMetamaskRunning ? 'Metamask found in browser and your account address is: ' + userAccount : 'Please install <a href="https://chrome.google.com/webstore/detail/metamask/nkbihfbeogaeaoehlefnkodbefgpgknn?hl=en" target="_blank"><span style="color: #4caf50;">MetaMask</span> </a> chrome extention to place the bet.';
  });
  newBetBox.detailListOpen = false;
  newBetBox.children[0].children[4].children[0].children[0].children[0].addEventListener('click', async()=> {
    const noList = newBetBox.children[0].children[4].children[0].children[0].children[1].children[0].children[1].children[1];
    const yesList = newBetBox.children[0].children[4].children[0].children[0].children[1].children[0].children[0].children[1];
    const drawList = newBetBox.children[0].children[4].children[0].children[0].children[1].children[0].children[2].children[1];
    if(newBetBox.detailListOpen) {
      newBetBox.children[0].children[4].children[0].children[0].children[1].style.display = 'none';
      newBetBox.detailListOpen = false;
      newBetBox.children[0].children[4].children[0].children[0].children[0].innerText = 'Display Bet Details';
      noList.innerText = 'Loading...';
      yesList.innerText = 'Loading...';
      drawList.innerText = 'Loading...';
    } else {
      // open the list and display the users
      newBetBox.children[0].children[4].children[0].children[0].children[1].style.display = 'block';
      newBetBox.detailListOpen = true;
      newBetBox.children[0].children[4].children[0].children[0].children[0].innerText = 'Hide Bet Details';
      const betInstance = new web3.eth.Contract(betAbi, _betAddress);

      const optionsVolume = [
        await betInstance.methods.totalBetTokensInExaEsByChoice(0).call(),
        await betInstance.methods.totalBetTokensInExaEsByChoice(1).call(),
        await betInstance.methods.totalBetTokensInExaEsByChoice(2).call()
      ]

      noList.innerText = optionsVolume[0] + ' ES';
      yesList.innerText = optionsVolume[0] + ' ES';
      drawList.innerText = optionsVolume[0] + ' ES';

      // const removeChildElements = node => {
      //   while (node.firstChild) {
      //     node.removeChild(node.firstChild);
      //   }
      // }
      // removeChildElements(noList);
      // removeChildElements(yesList);
      // removeChildElements(drawList);
      //
      // for(let i = 0; i < _countArray[0]; i++) {
      //   (async() => {
      //     const element = document.createElement('p');
      //     const bettor = await betInstance.methods.noBettors(i).call();
      //     console.log(bettor);
      //     element.innerText = '[' + bettor.bettorAddress + ' betted an amount of ' + ( bettor.betAmountInExaEs / ( 10**18 ) ) + ' ES]';
      //     noList.insertAdjacentElement('beforeend', element);
      //   })();
      // }
      //
      // for(let i = 0; i < _countArray[1]; i++) {
      //   (async() => {
      //     const element = document.createElement('p');
      //     element.innerText = await betInstance.methods.yesBettors(i).call();
      //     yesList.insertAdjacentElement('beforeend', element);
      //   })();
      // }
      //
      // for(let i = 0; i < _countArray[2]; i++) {
      //   (async() => {
      //     const element = document.createElement('p');
      //     element.innerText = await betInstance.methods.drawBettors(i).call();
      //     drawList.insertAdjacentElement('beforeend', element);
      //   })();
      // }


    }


  });
  return newBetBox;//betlist.appendChild(newBetBox);
};








const createEfficientBetBox = (_betAddress) => {
  //(_betAddress, _description, _category, _subCategory, _amount, _minimumBet, _pricePercentPerThousand, _timestamp)
  console.log('creating bet box'+_betAddress);
  const newBetBox = document.getElementsByClassName('betboxtheme')[0].cloneNode(true);
  newBetBox.removeAttribute('style');
  newBetBox.setAttribute('id', _betAddress);
  return newBetBox;
}
//
//   return newBetBox;//betlist.appendChild(newBetBox);
// };














const loadBets = async () => {
  numberOfBets = await betdeex.methods.getNumberOfBets().call();
  console.log('numberOfBets', numberOfBets);

  document.getElementById('betlist').innerHTML = '';

  for(let i = 0; i < numberOfBets; i++) {
    (async() => {
      const betAddress = await betdeex.methods.bets(i).call();
      console.log(betAddress);
      const betInstance = new web3.eth.Contract(betAbi, betAddress);
      const blockNumber = await betInstance.methods.creationBlockNumber().call();
      const block = await web3.eth.getBlock(blockNumber);
      const betCategory = await betInstance.methods.category().call();
      const betSubCategory = await betInstance.methods.subCategory().call();
      if(displayAllBets || betCategory == currentCategory && betSubCategory == currentSubCategory) {
        betlist.insertAdjacentElement(
          'beforeend',
          createEfficientBetBox(
            betAddress
            // await betInstance.methods.description().call(),
            // betCategory,
            // betSubCategory,
            // await betdeex.methods.betBalanceInExaEs(betAddress).call(),
            // await betInstance.methods.minimumBetInExaEs().call(),
            // await betInstance.methods.pricePercentPerThousand().call(),
            // block.timestamp
          )
        );
        const newBetBox = document.getElementById(betAddress);
        newBetBox.children[0].children[0].children[0].children[0].children[1].innerHTML = env.category[betCategory];
        newBetBox.children[0].children[0].children[0].children[0].children[3].innerHTML = env.subCategory[betCategory][betSubCategory];
        newBetBox.children[0].children[3].children[0].children[0].children[0].children[3].children[1].innerText = new Date(block.timestamp * 1000).toGMTString();
        newBetBox.children[0].children[3].children[0].children[0].children[0].children[3].children[2].innerText = new Date(block.timestamp * 1000).toLocaleString() + ' (in your local timezone)';

        let _description;
        (async() => {
          _description = await betInstance.methods.description().call();
          newBetBox.children[0].children[1].innerHTML = _description;
        })();
        (async() => {
          _amount = await betdeex.methods.betBalanceInExaEs(betAddress).call();
          newBetBox.children[0].children[3].children[0].children[0].children[0].children[0].children[1].children[0].innerText = _amount / 10**18 + ' ES';
        })();
        (async() => {
          const _minimumBet = await betInstance.methods.minimumBetInExaEs().call();
          newBetBox.children[0].children[3].children[0].children[0].children[0].children[1].children[1].children[0].innerText = _minimumBet / 10**18 + ' ES';
        })();
        (async() => {
          const _pricePercentPerThousand = await betInstance.methods.pricePercentPerThousand().call();
          newBetBox.children[0].children[3].children[0].children[0].children[0].children[2].children[1].children[0].innerText = (1000 - _pricePercentPerThousand) / 10;
        })();
        (async() => {

        })();
        (async() => {

        })();
        (async() => {

        })();

        newBetBox.children[0].children[3].children[0].children[0].children[1].addEventListener('click', async () => {
          //alert(_betAddress);
          betAddressInModal = betAddress;
          betmodal.children[0].children[0].children[1].children[0].children[0].children[1].innerText = _description || await betInstance.methods.description().call();
          betmodal.children[0].children[0].children[1].children[0].children[2].children[0].children[2].children[0].innerHTML = isMetamaskRunning ? 'Metamask found in browser and your account address is: ' + userAccount : 'Please install <a href="https://chrome.google.com/webstore/detail/metamask/nkbihfbeogaeaoehlefnkodbefgpgknn?hl=en" target="_blank"><span style="color: #4caf50;">MetaMask</span> </a> chrome extention to place the bet.';
        });

        newBetBox.detailListOpen = false;
        newBetBox.children[0].children[4].children[0].children[0].children[0].addEventListener('click', async()=> {
          const noList = newBetBox.children[0].children[4].children[0].children[0].children[1].children[0].children[1].children[1];
          const yesList = newBetBox.children[0].children[4].children[0].children[0].children[1].children[0].children[0].children[1];
          const drawList = newBetBox.children[0].children[4].children[0].children[0].children[1].children[0].children[2].children[1];
          if(newBetBox.detailListOpen) {
            newBetBox.children[0].children[4].children[0].children[0].children[1].style.display = 'none';
            newBetBox.detailListOpen = false;
            newBetBox.children[0].children[4].children[0].children[0].children[0].innerText = 'Display Bet Details';
            noList.innerText = 'Loading...';
            yesList.innerText = 'Loading...';
            drawList.innerText = 'Loading...';
          } else {
            // open the list and display the users
            newBetBox.children[0].children[4].children[0].children[0].children[1].style.display = 'block';
            newBetBox.detailListOpen = true;
            newBetBox.children[0].children[4].children[0].children[0].children[0].innerText = 'Hide Bet Details';
            const betInstance = new web3.eth.Contract(betAbi, betAddress);
            const optionsVolume = [
              await betInstance.methods.totalBetTokensInExaEsByChoice(0).call(),
              await betInstance.methods.totalBetTokensInExaEsByChoice(1).call(),
              await betInstance.methods.totalBetTokensInExaEsByChoice(2).call()
            ]
            console.log(optionsVolume);
            noList.innerText = optionsVolume[0] + ' ES';
            yesList.innerText = optionsVolume[0] + ' ES';
            drawList.innerText = optionsVolume[0] + ' ES';
          }
        });


      }
    })();
  }
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
     env.infuraUrl
    );
    console.log('Non-Ethereum browser detected. User should consider installing MetaMask!');
  }


  web3 = new Web3(provider);
  console.log('web3 object created', web3);
  //console.log(esContractAbi);
  esContract = new web3.eth.Contract(esContractAbi, env.esContractAddress);
  betdeex = new web3.eth.Contract(betdeexAbi, env.betdeexAdress);

  console.log('esContract object', esContract);
  console.log('betdeex object', betdeex);

  (async () => {
    const accounts = await web3.eth.getAccounts();
    userAccount = accounts[0];
    console.log('user account addr', userAccount);
    try {
      const mainEsBal = await esContract.methods.balanceOf(userAccount).call();
      document.getElementById('main-es-bal').innerText = (mainEsBal / (10**18) ) + ' ES';

      const betdeexEsBal = await betdeex.methods.getBettorBalance(userAccount).call();
      document.getElementById('betdeex-es-bal').innerText = (betdeexEsBal / (10**18) ) + ' ES';

      console.log(mainEsBal, betdeexEsBal, mainEsBal / 10**18);
    } catch (e) {
      console.log('get accounts error: ',e.message);
    }

  })();

//  (async () => {
  console.log(betdeex);
    numberOfBets = await betdeex.methods.getNumberOfBets().call();
    console.log('numberOfBets', numberOfBets);
    loadBets();
    // for(let i = 0; i < numberOfBets; i++) {
    //   (async() => {
    //     const betAddress = await betdeex.methods.bets(i).call();
    //     console.log(betAddress);
    //     const betInstance = new web3.eth.Contract(betAbi, betAddress);
    //     const blockNumber = await betInstance.methods.creationBlockNumber().call();
    //     const block = await web3.eth.getBlock(blockNumber);
    //     betlist.insertAdjacentElement(
    //       'beforeend',
    //       createBetBox(
    //         betAddress,
    //         await betInstance.methods.description().call(),
    //         await betInstance.methods.category().call(),
    //         await betInstance.methods.subCategory().call(),
    //         await betdeex.methods.betBalanceInExaEs(betAddress).call(),
    //         await betInstance.methods.minimumBetInExaEs().call(),
    //         await betInstance.methods.pricePercentPerThousand().call(),
    //         block.timestamp
    //       )
    //     );
    //   })();
    // }
    //
    // let events;
    //
    // // try {
    // //   events = await betdeex.getPastEvents('NewBetContract', {
    // //     fromBlock: 1
    // //   });
    // // } catch (e) {
    // //   console.log(err.message);
    // // }
    //
    //
    // const betdeexW = web3old.eth.contract(betdeexAbi).at(env.betdeexAdress);
    // betdeexW.NewBetContract().get((err, res) => {
    //   console.log(res);
    //   events = res;
    // });

    // console.log('events', events);

    // for(let ev of events) {
    //   // if(ev.returnValues[3] != category) {
    //   //   continue;
    //   // }
    //   (async() => {
    //     const betAddress = ev.args[1];
    //     const block = await web3.eth.getBlock(ev.blockNumber);
    //     //console.log('timestamp', block.timestamp);
    //     console.log('bet address', betAddress);
    //     const betInstance = new web3.eth.Contract(betAbi, betAddress);
    //     betlist.insertAdjacentElement(
    //       'beforeend',
    //       createBetBox(
    //         betAddress,
    //         await betInstance.methods.description().call(),
    //         await betInstance.methods.category().call(),
    //         await betdeex.methods.betBalanceInExaEs(betAddress).call(),
    //         await betInstance.methods.minimumBetInExaEs().call(),
    //         await betInstance.methods.pricePercentPerThousand().call(),
    //         block.timestamp,
    //         [
    //           await betInstance.methods.getNumberOfChoiceBettors(0).call(),
    //           await betInstance.methods.getNumberOfChoiceBettors(1).call(),
    //           await betInstance.methods.getNumberOfChoiceBettors(2).call()
    //         ]
    //       )
    //     );
    //   })();
    // }

//  })();




});




document.getElementById('modalSubmit').addEventListener('click', async() => {
  // sign and send transaction.
  const choice = Number(document.getElementById('modal-option').value);
  const amount = Number(document.getElementById('modal-es-amount').value);

  const betInstance = web3old.eth.contract(betAbi).at(betAddressInModal);



  document.getElementById('modalSubmit').children[1].innerText = 'Please wait..';

  try {
    // await betInstance.methods.enterBet(choice, amount * (10**18)).send({ from: userAccount });
    betInstance.enterBet(choice, amount * (10**18), (err, result) => {
      if(err) {
        console.log(err.message);
      }
      console.log(result);
    });
    //console.log('Successfully sent bet');
  } catch (e) {
    console.log(e.message);
  }

  //to get submit notification
  const betWold = web3old.eth.contract(betAbi).at(betAddressInModal);
  betWold.NewBetting().watch((err, res) => {
    console.log(res);
    events = res;
    alert('transaction successful');
  });

  document.getElementById('modalSubmit').children[1].innerText = 'PLACE A BET';
});


const makeMenuItemLive = (_id, _category, _subCategory) => {
  document.getElementById(_id).addEventListener('click', ()=>{
    displayAllBets = false;
    currentCategory = _category;
    currentSubCategory = _subCategory;
    console.log('loading the cat-sub cat', _category, _subCategory);
    document.getElementById('categoryDisplay').innerText = env.subCategory[_category][_subCategory];
    loadBets();
  });
}

makeMenuItemLive('football', 0, 0);
makeMenuItemLive('cricket', 0, 1);
