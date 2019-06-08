var web3old = window.web3;
var web3;
var provider;
var userAccount;
var isMetamaskRunning = false;
var numberOfBets;
var betAddressInModal; // declared for noting which bet user clicked
var currentCategory, currentSubCategory, displayAllBets = true;
var esContract, betdeex, betdeexW3old;
var updateUserBalance, updateManagerPanel, updateSuperManagerPanel;

// const createBetBox = (_betAddress, _description, _category, _subCategory, _amount, _minimumBet, _pricePercentPerThousand, _timestamp) => {
//   console.log('creating bet box'+_betAddress);
//   const newBetBox = document.getElementsByClassName('betboxtheme')[0].cloneNode(true);
//   newBetBox.removeAttribute('style');
//   newBetBox.setAttribute('id', _betAddress);
//   newBetBox.children[0].children[0].children[0].children[0].children[1].innerHTML = env.category[_category];
//   newBetBox.children[0].children[0].children[0].children[0].children[3].innerHTML = env.subCategory[_category][_subCategory];
//   newBetBox.children[0].children[1].innerHTML = _description;
//   newBetBox.children[0].children[3].children[0].children[0].children[0].children[0].children[1].children[0].innerText = _amount / 10**18 + ' ES';
//   newBetBox.children[0].children[3].children[0].children[0].children[0].children[1].children[1].children[0].innerText = _minimumBet / 10**18 + ' ES';
//   newBetBox.children[0].children[3].children[0].children[0].children[0].children[2].children[1].children[0].innerText = (1000 - _pricePercentPerThousand) / 10;
//   newBetBox.children[0].children[3].children[0].children[0].children[0].children[3].children[1].innerText = new Date(_timestamp * 1000).toGMTString();
//   newBetBox.children[0].children[3].children[0].children[0].children[0].children[3].children[2].innerText = new Date(_timestamp * 1000).toLocaleString() + ' (in your local timezone)';
//   newBetBox.children[0].children[3].children[0].children[0].children[1].addEventListener('click', () => {
//     //alert(_betAddress);
//     betAddressInModal = _betAddress;
//     betmodal.children[0].children[0].children[1].children[0].children[0].children[1].innerText = _description;
//     betmodal.children[0].children[0].children[1].children[0].children[2].children[0].children[2].children[0].innerHTML = isMetamaskRunning ? 'Metamask found in browser and your account address is: ' + userAccount : 'Please install <a href="https://chrome.google.com/webstore/detail/metamask/nkbihfbeogaeaoehlefnkodbefgpgknn?hl=en" target="_blank"><span style="color: #4caf50;">MetaMask</span> </a> chrome extention to place the bet.';
//   });
//   newBetBox.detailListOpen = false;
//   newBetBox.children[0].children[4].children[0].children[0].children[0].addEventListener('click', async()=> {
//     const noList = newBetBox.children[0].children[4].children[0].children[0].children[1].children[0].children[1].children[1];
//     const yesList = newBetBox.children[0].children[4].children[0].children[0].children[1].children[0].children[0].children[1];
//     const drawList = newBetBox.children[0].children[4].children[0].children[0].children[1].children[0].children[2].children[1];
//     if(newBetBox.detailListOpen) {
//       newBetBox.children[0].children[4].children[0].children[0].children[1].style.display = 'none';
//       newBetBox.detailListOpen = false;
//       newBetBox.children[0].children[4].children[0].children[0].children[0].innerText = 'Display Bet Details';
//       noList.innerText = 'Loading...';
//       yesList.innerText = 'Loading...';
//       drawList.innerText = 'Loading...';
//     } else {
//       // open the list and display the users
//       newBetBox.children[0].children[4].children[0].children[0].children[1].style.display = 'block';
//       newBetBox.detailListOpen = true;
//       newBetBox.children[0].children[4].children[0].children[0].children[0].innerText = 'Hide Bet Details';
//       const betInstance = new web3.eth.Contract(betAbi, _betAddress);
//
//       const optionsVolume = [
//         await betInstance.methods.totalBetTokensInExaEsByChoice(0).call(),
//         await betInstance.methods.totalBetTokensInExaEsByChoice(1).call(),
//         await betInstance.methods.totalBetTokensInExaEsByChoice(2).call()
//       ]
//
//       noList.innerText = ( optionsVolume[0] / 10**18 )  + ' ES';
//       yesList.innerText = ( optionsVolume[1] / 10**18 ) + ' ES';
//       drawList.innerText = ( optionsVolume[2] / 10**18 ) + ' ES';
//
//       // const removeChildElements = node => {
//       //   while (node.firstChild) {
//       //     node.removeChild(node.firstChild);
//       //   }
//       // }
//       // removeChildElements(noList);
//       // removeChildElements(yesList);
//       // removeChildElements(drawList);
//       //
//       // for(let i = 0; i < _countArray[0]; i++) {
//       //   (async() => {
//       //     const element = document.createElement('p');
//       //     const bettor = await betInstance.methods.noBettors(i).call();
//       //     console.log(bettor);
//       //     element.innerText = '[' + bettor.bettorAddress + ' betted an amount of ' + ( bettor.betAmountInExaEs / ( 10**18 ) ) + ' ES]';
//       //     noList.insertAdjacentElement('beforeend', element);
//       //   })();
//       // }
//       //
//       // for(let i = 0; i < _countArray[1]; i++) {
//       //   (async() => {
//       //     const element = document.createElement('p');
//       //     element.innerText = await betInstance.methods.yesBettors(i).call();
//       //     yesList.insertAdjacentElement('beforeend', element);
//       //   })();
//       // }
//       //
//       // for(let i = 0; i < _countArray[2]; i++) {
//       //   (async() => {
//       //     const element = document.createElement('p');
//       //     element.innerText = await betInstance.methods.drawBettors(i).call();
//       //     drawList.insertAdjacentElement('beforeend', element);
//       //   })();
//       // }
//
//
//     }
//
//
//   });
//   return newBetBox;//betlist.appendChild(newBetBox);
// };








const createEfficientBetBox = (_betAddress) => {
  //(_betAddress, _description, _category, _subCategory, _amount, _minimumBet, _pricePercentPerThousand, _timestamp)
  //console.log('displaying bet box'+_betAddress);
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

  // these 2 instructions moved below the async method for better UX. old bets were visible
  document.getElementById('results-table').style.display = 'none';
  document.getElementById('betlist').innerHTML = '';
  document.getElementById('betsDisplaySection').style.display = 'block';

  for(let i = numberOfBets - 1; i >= 0; i--) {
    (async() => {elementDisplay:{
      const betAddress = await betdeex.methods.bets(i).call();
      const betInstance = new web3.eth.Contract(betAbi, betAddress);
      const endedBy = await betInstance.methods.endedBy().call();
      //console.log('endedby:',endedBy,endedBy!=0x0);
      if(endedBy!=0x0) break elementDisplay;
      console.log('building display for',betAddress);
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
            noList.innerText = ( optionsVolume[0] / 10**18 )  + ' ES';
            yesList.innerText = ( optionsVolume[1] / 10**18 ) + ' ES';
            drawList.innerText = ( optionsVolume[2] / 10**18 ) + ' ES';
          }
        });
        const endBetDiv = newBetBox.lastElementChild.lastElementChild.lastElementChild;
        endBetDiv.lastElementChild.addEventListener('click', async()=>{
          endBetDiv.lastElementChild.innerText = 'Ending bet...';
          endBetDiv.children[2] = 'Signing transaction and sending...';
          const contractAddress = newBetBox.getAttribute('id');
          const choice = endBetDiv.firstElementChild.value;
          const betW3old = web3old.eth.contract(betAbi).at(contractAddress);
          console.log('preparing to end bet',contractAddress,choice);
          betW3old.endBet(choice, (err, result)=>{
            if(err) {
              console.log(err.message);
            } else {
              endBetDiv.lastElementChild.innerText = 'endBet tx sent';
              endBetDiv.lastElementChild.setAttribute('disabled', true);
            }
            console.log(result);
            endBetDiv.children[2].innerText = 'Tx hash: ' + result;
          });
        });

      }
    }})();
  }
};






const createResultTd = (betAddress) => {
  const tdTemplate = document.getElementById('results-table').firstElementChild.firstElementChild.firstElementChild.children[1].children[0].lastElementChild.cloneNode(true);
  tdTemplate.removeAttribute('style');
  tdTemplate.setAttribute('id', 'result'+betAddress);
  return tdTemplate;
}




const loadResults = async () => {

  numberOfBets = await betdeex.methods.getNumberOfBets().call();
  console.log('numberOfBets', numberOfBets);

  document.getElementById('results-table').firstElementChild.firstElementChild.firstElementChild.firstElementChild.firstElementChild.innerText = 'Event Result (Please wait...)';
  document.getElementById('results-table').style.display = 'block';
  document.getElementById('betsDisplaySection').style.display = 'none';

  const tableElement = document.getElementById('results-table').firstElementChild.firstElementChild.firstElementChild.children[1];
  tableElement.children[1].innerHTML = '';

  for(let i = numberOfBets - 1; i >= 0; i--) {
    (async() => {elementDisplay:{
      const betAddress = await betdeex.methods.bets(i).call();
      const betInstance = new web3.eth.Contract(betAbi, betAddress);
      const endedBy = await betInstance.methods.endedBy().call();
      //console.log('endedby:',endedBy,endedBy!=0x0);
      if(endedBy==0x0) break elementDisplay;
      console.log('building result for',betAddress);
      // const blockNumber = await betInstance.methods.endBlockNumber().call();
      // const block = await web3.eth.getBlock(blockNumber);
      const betCategory = await betInstance.methods.category().call();
      const betSubCategory = await betInstance.methods.subCategory().call();
      if(displayAllBets || betCategory == currentCategory && betSubCategory == currentSubCategory) {
        tableElement.children[1].insertAdjacentElement(
          'beforeend',
          createResultTd(
            betAddress
          )
        );
        const newResultComponent = document.getElementById('result'+betAddress);
        newResultComponent.children[0].firstElementChild.firstElementChild.innerText = env.category[betCategory] + ' / ' + env.subCategory[betCategory][betSubCategory];
        (async()=>{
          //start time
          const blockNumber = await betInstance.methods.creationBlockNumber().call();
          const block = await web3.eth.getBlock(blockNumber);
          newResultComponent.children[0].firstElementChild.lastElementChild.innerText = new Date(block.timestamp * 1000).toGMTString();
        })();

        (async()=>{
          //description
          const description = await betInstance.methods.description().call();
          newResultComponent.children[1].innerText = description;
        })();

        (async()=>{
          //end time
          const blockNumber = await betInstance.methods.endBlockNumber().call();
          const block = await web3.eth.getBlock(blockNumber);
          newResultComponent.children[2].innerText = new Date(block.timestamp * 1000).toGMTString();
        })();

        (async()=>{
          const finalResult = Number(await betInstance.methods.finalResult().call());
          console.log('final result', finalResult);
          switch (finalResult) {
            case 0:
              newResultComponent.children[3].innerText = 'No';
              break;
            case 1:
              newResultComponent.children[3].innerText = 'Yes';
              break;
            case 2:
              newResultComponent.children[3].innerText = 'Draw';
              break;
          }
        })();

        (async()=>{
          //total bid
          const blockNumber = await betInstance.methods.endBlockNumber().call();
          const betBalanceBeforeEnd = await betInstance.methods.betBalanceInExaEs().call(undefined, blockNumber - 1);
          newResultComponent.children[4].innerText = ( betBalanceBeforeEnd / 10**18 ) + ' ES';
        })();


      }
    }})();
  }
  setTimeout(()=>{document.getElementById('results-table').firstElementChild.firstElementChild.firstElementChild.firstElementChild.firstElementChild.innerText = 'Event Result';},1000);
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
  if(web3old) betdeexW3old = web3old.eth.contract(betdeexAbi).at(env.betdeexAdress);

  console.log('esContract object', esContract);
  console.log('betdeex object', betdeex);
  console.log('betdeexW3old object', betdeexW3old);

  (async () => {
    const accounts = await web3.eth.getAccounts();
    userAccount = accounts[0];
    console.log('user account addr', userAccount);
    if(userAccount) {
      document.getElementById('uAccount').children[0].innerText = 'Connected to ES account on Blockchain';
      document.getElementById('uAccount').children[2].innerText = userAccount;
      document.getElementById('uAccount').removeAttribute('href');
      setInterval(async()=>{
        const accounts = await web3.eth.getAccounts();
        if(accounts[0] != userAccount) {
          console.log('User Account changed');
          userAccount = accounts[0];
          updateSuperManagerPanel();
          updateManagerPanel();
          updateUserBalance();
        }
      },500);
      setInterval(async()=>{
        updateUserBalance();
      },4000);
      updateManagerPanel = async()=>{
        const isManager = await betdeex.methods.isManager(userAccount).call();
        console.log('isManager:', isManager);
        if(isManager) {
          document.getElementById('managerPanel').style.display = 'block';
          //document.getElementById('endBetDiv').style.display = 'block';
          var cssRuleCode = document.all ? 'rules' : 'cssRules'; //account for IE and FF
          document.styleSheets[7][cssRuleCode][1].style.display = 'block';
        } else {
          document.getElementById('managerPanel').style.display = 'none';
          //document.getElementById('endBetDiv').style.display = 'block';
          var cssRuleCode = document.all ? 'rules' : 'cssRules'; //account for IE and FF
          document.styleSheets[7][cssRuleCode][1].style.display = 'none';
        }
      };
      updateManagerPanel();
      updateSuperManagerPanel = async()=>{
        const superAddress = await betdeex.methods.superManager().call();
        console.log('superAddress: ', superAddress);
        if(userAccount === superAddress) {
          console.log('this is a super account!');
          document.getElementById('superManagerPanel').style.display = 'block';
        } else {
          document.getElementById('superManagerPanel').style.display = 'none';
        }
      }; updateSuperManagerPanel();
    } else {
      document.getElementById('uAccount').children[0].innerText = 'Cannot connect to MetaMask';
    }
    updateUserBalance = async() => {
      try {
        const mainEsBal = await esContract.methods.balanceOf(userAccount).call();
        document.getElementById('main-es-bal').innerText = (mainEsBal / (10**18) ) + ' ES';

        const betdeexEsBal = await betdeex.methods.getBettorBalance(userAccount).call();
        document.getElementById('betdeex-es-bal').innerText = (betdeexEsBal / (10**18) ) + ' ES';

        document.getElementById('betdeex-recharge').style.display = 'inline';
        //document.getElementById('betdeex-recharge-box').style.display = 'block';

        //console.log(mainEsBal, betdeexEsBal, mainEsBal / 10**18);
      } catch (e) {
        console.log('get accounts error: ',e.message);
        const node = document.getElementById('betdeex-recharge-box');
        node.parentNode.removeChild(node);
      }
    }; updateUserBalance();
  })();

//  (async () => {
  console.log(betdeex);
  // numberOfBets = await betdeex.methods.getNumberOfBets().call();
  // console.log('numberOfBets', numberOfBets);
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
  betWold.NewBetting().watch(async (err, res) => {
    console.log(res);
    events = res;
    const accounts = await web3.eth.getAccounts();
    console.log('Bet placed', accounts[0], res.args._bettorAddress);
    if(accounts[0].toLowerCase() == res.args._bettorAddress) {
      document.getElementById('modalSubmit').children[1].innerText = 'PLACE A BET';

      loadBets();

      const mainEsBal = await esContract.methods.balanceOf(userAccount).call();
      document.getElementById('main-es-bal').innerText = (mainEsBal / (10**18) ) + ' ES';

      const betdeexEsBal = await betdeex.methods.getBettorBalance(userAccount).call();
      document.getElementById('betdeex-es-bal').innerText = (betdeexEsBal / (10**18) ) + ' ES';
      alert('Bet Placed successfully!');
    }
  });
});



const makeMenuItemLive = (_id, _category, _subCategory) => {
  document.getElementById(_id).addEventListener('click', ()=>{
    displayAllBets = false;
    currentCategory = _category;
    currentSubCategory = _subCategory;
    console.log('loading the cat-sub cat', _category, _subCategory);
    document.getElementById('categoryDisplay').innerText = env.subCategory[_category][_subCategory];
    document.getElementById('categoryDisplay2').innerText = 'View '+env.subCategory[_category][_subCategory]+' Results';
    loadBets();
  });
}

document.getElementById('viewAll').addEventListener('click', ()=>{
  displayAllBets = true;
  currentCategory = null;
  currentSubCategory = null;
  loadBets();
  console.log('loading all bets');
  document.getElementById('categoryDisplay').innerText = 'All';
  document.getElementById('categoryDisplay2').innerText = 'View All Results';
});

for(let i = 0; i < env.category.length; i++) {
  const li = document.getElementById('c'+i);
  li.insertAdjacentElement('beforeend',document.createElement('ul'));
  const ul = li.children[1];
  ul.setAttribute('class', 'dropdown-menu dropdown-inner');
  ul.setAttribute('role', 'menu');
  for(let j = 0; j < env.subCategory[i].length; j++) {
    const childLi = document.createElement('li');
    childLi.setAttribute('id', 'c'+i+'s'+j);
    childLi.innerHTML = '<a>'+env.subCategory[i][j]+'</a>';
    ul.insertAdjacentElement('beforeend',childLi);
    makeMenuItemLive('c'+i+'s'+j, i, j);
  }
}


makeMenuItemLive('c0s0', 0, 0);
makeMenuItemLive('c0s1', 0, 1);

document.getElementById('managerPanel').children[4].innerHTML = ''; //empty placeholder options
for(let categoryId in env.category) {
  const optionElement = document.createElement('option');
  optionElement.setAttribute('value', categoryId);
  optionElement.innerText = env.category[categoryId];
  document.getElementById('managerPanel').children[4].insertAdjacentElement('beforeend',optionElement);
}

document.getElementById('managerPanel').children[4].addEventListener('onchange',()=>{
  const newBetCategory = document.getElementById('managerPanel').children[4];
  for(let categoryId in env.subCategory[newBetCategory]) {
    const optionElement = document.createElement('option');
    optionElement.setAttribute('value', categoryId);
    optionElement.innerText = env.category[categoryId];
    document.getElementById('managerPanel').children[7].innerHTML = '';
    document.getElementById('managerPanel').children[7].insertAdjacentElement('beforeend',optionElement);
  }
});






// manager

document.getElementById('superManagerPanel').children[2].addEventListener('click',async()=>{
  document.getElementById('superManagerPanel').children[4].innerText = 'Loading...';
  const userInputAddress = document.getElementById('superManagerPanel').children[1].value;
  const isManager = await betdeex.methods.isManager(userInputAddress).call();
  console.log('isManager view priviliges',isManager);

  //var betdeexW3old = web3old.eth.contract(betdeexAbi).at(env.betdeexAdress);
  if(isManager) {
    document.getElementById('superManagerPanel').children[4].innerText = 'Yes, ' + userInputAddress + 'has manager previliges of BetDeEx Smart Contract';
    document.getElementById('superManagerPanel').children[6].innerText = 'Remove Manager';
    document.getElementById('superManagerPanel').children[6].addEventListener('click', async()=>{
      //send transaction to remove manager
      document.getElementById('superManagerPanel').children[4].innerText = 'Signing transaction and sending...';
      console.log('sending tx to remove manager');
      betdeexW3old.removeManager(userInputAddress, (err, result) => {
        if(err) {
          console.log(err.message);
          document.getElementById('superManagerPanel').children[4].innerText = err.message;
        } else {
          document.getElementById('superManagerPanel').children[4].innerText = 'Tx hash: ' + result + '. Please try view previliges after 15 secs';
        }
        console.log(result);

      });
    });
  } else {
    document.getElementById('superManagerPanel').children[4].innerText = 'No, ' + userInputAddress + ' does not have manager previliges of BetDeEx Smart Contract';
    document.getElementById('superManagerPanel').children[6].innerText = 'Add Manager';
    document.getElementById('superManagerPanel').children[6].addEventListener('click', async()=>{
      //send transaction to add manager
      document.getElementById('superManagerPanel').children[4].innerText = 'Signing transaction and sending...';
      console.log('sending tx to remove manager');
      betdeexW3old.addManager(userInputAddress, (err, result) => {
        if(err) {
          console.log(err.message);
          document.getElementById('superManagerPanel').children[4].innerText = err.message;
        } else {
          document.getElementById('superManagerPanel').children[4].innerText = 'Tx hash: ' + result + '. Please try view previliges after 15 secs';
        }
        console.log(result);

      });
    });
  }

});




document.getElementById('managerPanel').children[12].addEventListener('click', async()=>{
  const description = document.getElementById('managerPanel').children[1].value;
  const category = Number(document.getElementById('managerPanel').children[4].value);
  const subCategory = Number(document.getElementById('managerPanel').children[7].value);
  const minimumBet = Number(document.getElementById('managerPanel').children[9].value) * 10**18;

  document.getElementById('managerPanel').children[11].innerText = 'Signing transaction and sending...';
  console.log(description,category,subCategory,minimumBet,998);
  betdeexW3old.createBet(description, category, subCategory, minimumBet, 998, (err, result) => {
    if(err) {
      console.log(err.message);
      document.getElementById('managerPanel').children[11].innerText = err.message;
    } else {
      document.getElementById('managerPanel').children[11].innerText = 'Tx hash: ' + result + '. Please try view previliges after 15 secs';
    }
    console.log(result);

  });
});





document.getElementById('betdeex-recharge-box').children[0].children[0].children[0].children[4].addEventListener('click', async()=>{
  const esW3old = web3old.eth.contract(esContractAbi).at(env.esContractAddress);
  const amount = (document.getElementById('betdeex-recharge-box').children[0].children[0].children[0].children[2].value) * 10**18;
  console.log('attempting to add balance to BetDeEx', amount, '0x'+env.betdeexAdress);
  document.getElementById('betdeex-recharge-box').children[0].children[0].children[0].children[4].innerText = 'Signing tx...';
  esW3old.increaseApproval('0x'+env.betdeexAdress, amount, (err, result) => {
    if(err) {
      console.log(err.message);
      document.getElementById('betdeex-recharge-box').children[0].children[0].children[0].children[0].innerText = err.message;
    } else {
      document.getElementById('betdeex-recharge-box').children[0].children[0].children[0].children[0].innerHTML = 'Tx hash: ' + result + '. <br>Please try view previliges after 15 secs';
    }
    console.log(result);
    document.getElementById('betdeex-recharge-box').children[0].children[0].children[0].children[4].innerText = 'Add ES again';
  });
});
