<p align="center">
  <a href="https://zemse.github.io/betdeex/" rel="noopener">
 <img width=50% src="../images/betdeex-logo.png" ></a>
</p>

<h3 align="center">BetDeEx</h3>
<center>


</center>

<div align="center">




</div>

------------------------------------------

>Your Decentralized Betting Platform


------------------------------------------
### BetDeEx by Era Swap

- ES Token is Era Swap token that is used to exchange value in Era Swap Ecosystem. https://eraswaptoken.io
- BetDeEx is a betting / prediction product to predict live events through a bet.
- A bet consists of Question, 3 choices (Yes, No, Draw) or 2 choices (Yes, No), Minimum bet amount (only in ES), and category/subcategory to group similar bets.
- Super Manager can create bets and they also can give rights to any specific account to create bets. This specific account becomes a Manager.
- Manager can only create bets, they cannot give another account status of Manager.
- The bet is deployed as a Smart Contract. And anyone can spend ES tokens more than the specified minimum for every bet on Yes, No or Draw.
- Bettor of a Bet is an account that has spent ES on the bet on Yes, No or Draw.
- To place a bet, bettor either needs to have enough ES allowance for BetDeEx smart contract or he/she should already have some ES in bettorWonExaEs mapping stored in BetDeEx smart contract (amount won by Bettor in previous bets is transferred to bettorWonExaEs mapping).
- Bettors can place multiple bettings, on multiple choices, these will be considered as separate bettings.
- The bet will continue to accept bets only until pauseTimestamp, which will be specified by manager while creating the bet.
- A bet is ended by a manager after pauseTimestamp, by providing the winning choice and a small portion of the prize pool is to be collected as fees. For e.g. 0.2%. This can be different for different bets.
- The funds are distributed among the Bettors of the betting in the bet in proportion of their ES amount (For eg. 100ES, 200ES, 300ES are betted on Yes. Sum of No and Draw betting is 600ES and if finally it is declared that Yes is winner. Total bet sums up to 1200ES, from 1200ES first a small platform fee will be collected 0.2%, platform fee is 2.4ES, then prize pool is 1200-2.4 = 1197.6ES and it will be distributed in ratio of 1:2:3 i.e 199.6ES, 399.2ES and 598.8ES will be sent to winners).
- After a bet is ended, it should be available for querying past data / audits.
