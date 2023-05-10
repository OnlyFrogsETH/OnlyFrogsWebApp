import React, { useState, useEffect } from "react";
import OnlyFrogsStaking from "./contracts/OnlyFrogsStaking.json";
import Web3 from "web3";

function App() {
  const [web3, setWeb3] = useState(null);
  const [accounts, setAccounts] = useState([]);
  const [contract, setContract] = useState(null);
  const [onlyFrogsBalance, setOnlyFrogsBalance] = useState(0);
  const [onlyFrogsLPBalance, setOnlyFrogsLPBalance] = useState(0);
  const [stakedBalance, setStakedBalance] = useState(0);
  const [earnedRewards, setEarnedRewards] = useState(0);
  const [stakingRate, setStakingRate] = useState(0);

  useEffect(() => {
    async function init() {
      // Initialize web3 provider
      const provider = await window.ethereum;
      await provider.request({ method: "eth_requestAccounts" });
      const web3Instance = new Web3(provider);
      setWeb3(web3Instance);

      // Get user accounts
      const accounts = await web3Instance.eth.getAccounts();
      setAccounts(accounts);

      // Load contract
      const networkId = await web3Instance.eth.net.getId();
      const deployedNetwork = OnlyFrogsStaking.networks[networkId];
      const contractInstance = new web3Instance.eth.Contract(
        OnlyFrogsStaking.abi,
        deployedNetwork && deployedNetwork.address
      );
      setContract(contractInstance);

      // Get user balances and staked balance
      const onlyFrogsBalance = await contractInstance.methods
        .onlyFrogs()
        .balanceOf(accounts[0])
        .call();
      setOnlyFrogsBalance(onlyFrogsBalance);

      const onlyFrogsLPBalance = await contractInstance.methods
        .onlyFrogsLP()
        .balanceOf(accounts[0])
        .call();
      setOnlyFrogsLPBalance(onlyFrogsLPBalance);

      const stakedBalance = await contractInstance.methods
        .staked(accounts[0])
        .call();
      setStakedBalance(stakedBalance);

      const earnedRewards = await contractInstance.methods
        .rewards(accounts[0])
        .call();
      setEarnedRewards(earnedRewards);

      const stakingRate = await contractInstance.methods.stakingRate().call();
      setStakingRate(stakingRate);
    }
    init();
  }, []);

  async function stake() {
    // Calculate LP amount
    const amount = document.getElementById("stake-amount").value;
    const lpAmount = await contract.methods.calculateLP(amount).call();

    // Approve and stake tokens
    await contract.methods.onlyFrogsLP().approve(contract.options.address, lpAmount).send({ from: accounts[0] });
    await contract.methods.stake(lpAmount).send({ from: accounts[0] });

    // Update balances
    const onlyFrogsLPBalance = await contract.methods.onlyFrogsLP().balanceOf(accounts[0]).call();
    setOnlyFrogsLPBalance(onlyFrogsLPBalance);

    const stakedBalance = await contract.methods.staked(accounts[0]).call();
    setStakedBalance(stakedBalance);
  }

  async function unstake() {
    // Calculate LP amount
    const amount = document.getElementById("unstake-amount").value;
	const lpAmount = await contract.methods.calculateLP(amount).call();
	
	// Unstake tokens
await contract.methods.unstake(lpAmount).send({ from: accounts[0] });

// Update balances
const onlyFrogsLPBalance = await contract.methods.onlyFrogsLP().balanceOf(accounts[0]).call();
setOnlyFrogsLPBalance(onlyFrogsLPBalance);

const stakedBalance = await contract.methods.staked(accounts[0]).call();
setStakedBalance(stakedBalance);
}

async function getReward() {
// Get earned rewards
const earnedRewards = await contract.methods.rewards(accounts[0]).call();
setEarnedRewards(earnedRewards);

// Withdraw rewards
await contract.methods.getReward().send({ from: accounts[0] });

// Update balances
const onlyFrogsBalance = await contract.methods.onlyFrogs().balanceOf(accounts[0]).call();
setOnlyFrogsBalance(onlyFrogsBalance);
}

return (
<div className="App">
<h1>OnlyFrogs Staking</h1>
<h2>Account: {accounts[0]}</h2>
<h3>OnlyFrogs Balance: {onlyFrogsBalance}</h3>
<h3>OnlyFrogs LP Balance: {onlyFrogsLPBalance}</h3>
<h3>Staked Balance: {stakedBalance}</h3>
<h3>Earned Rewards: {earnedRewards}</h3>
<h3>Staking Rate: {stakingRate} OnlyFrogs per block</h3>
<h2>Stake Tokens</h2>
<form onSubmit={(e) => { e.preventDefault(); stake(); }}>
<label htmlFor="stake-amount">Amount:</label>
<input type="text" id="stake-amount" />
<button type="submit">Stake</button>
</form>
<h2>Unstake Tokens</h2>
<form onSubmit={(e) => { e.preventDefault(); unstake(); }}>
<label htmlFor="unstake-amount">Amount:</label>
<input type="text" id="unstake-amount" />
<button type="submit">Unstake</button>
</form>
<h2>Get Reward</h2>
<button onClick={() => { getReward(); }}>Get Reward</button>
</div>
);
}

export default App;
   
