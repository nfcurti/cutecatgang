import Head from 'next/head'
import Image from 'next/image'
import styles from '../styles/Home.module.css'
import Countdown from 'react-countdown';
import Slider, { Range } from 'rc-slider';
import 'rc-slider/assets/index.css';
import { useEffect, useState } from "react";
import ContractData from '../config/Contract.json';
const Web3 = require('web3');
import detectEthereumProvider from '@metamask/detect-provider'

export default function Home() {
  const _chainIdToCompare = 1; //Ethereum
  // const _chainIdToCompare = 4; //Rinkeby
  const [traits, setTraits] = useState(0)
  const [userAddress, setUserAddress] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const [mintForAllStartDate, setMintForAllStartDate] = useState(0);
  const [remainingNFTs, setRemainingNFTs] = useState(0);

  useEffect(async () => {
    loadIndependentData();
  }, []);

  const loadIndependentData = async() => {
    var currentProvider = new Web3.providers.HttpProvider(`https://${_chainIdToCompare == 1 ? 'mainnet' : 'rinkeby'}.infura.io/v3/be634454ce5d4bf5b7f279daf860a825`);
    const web3 = new Web3(currentProvider);
    const contract = new web3.eth.Contract(ContractData.abi, ContractData.address);


      const mintForAllStartDateX = await contract.methods._mintForAllStartDate().call();
     
      setMintForAllStartDate(mintForAllStartDateX);

      const maxSupply = await contract.methods.maxSupply().call();
      const totalSupply = await contract.methods.totalSupply().call();
      setRemainingNFTs(maxSupply - totalSupply);
  }

  // Random component
  const Completionist = () => userAddress == '' ? <button onClick={async () => {
    connectMetamaskPressed();
  }} className={styles.lbutton}>Connect first</button> : <>

  {[1, 3, 5, 10, 15, 20].map(n => <button onClick={() => {
    mint(n);
  }} className={styles.lbutton}>Mint x{n}</button>)}
  
  </>;


  // Renderer callback with condition
  const renderer = ({ days, hours, minutes, seconds, completed }) => {
    if (completed) {
      // Render a completed state
      return <Completionist />;
    } else {
      // Render a countdown
      return <p>Time to launch: <br/><button>{days} days {hours} hs<br/> {minutes} min {seconds} sec</button></p>;
    }
  };

  const requestAccountMetamask = async() => {
    const accounts = await ethereum.request({ method: 'eth_requestAccounts' });
    
    if(accounts.length > 0) {
      setUserAddress(accounts[0]);

      const chainId = await ethereum.request({ method: 'eth_chainId' });
      handleChainChanged(chainId);

      ethereum.on('chainChanged', handleChainChanged);

      function handleChainChanged(_chainId) {
        if(_chainId != _chainIdToCompare) {
          window.location.reload();
        }
      }

      ethereum.on('accountsChanged', handleAccountsChanged);

      async function handleAccountsChanged(accounts) {
        if (accounts.length === 0) {
          setUserAddress('');
          
          // loadDataAfterAccountDetected();
        } else if (accounts[0] !== userAddress) {
          const chainId = await ethereum.request({ method: 'eth_chainId' });
          setUserAddress(chainId == _chainIdToCompare ? accounts[0] : 'CONNECT');
          
          
        }
      }
    }
  }

  const connectMetamaskPressed = async () => {
    try { 
      await window.ethereum.enable();
      requestAccountMetamask();
   } catch(e) {
      // User has denied account access to DApp...
   }
    try {
      await ethereum.request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId: '0x'+_chainIdToCompare }],
      });
      requestAccountMetamask();
    } catch (error) {
      
      // This error code indicates that the chain has not been added to MetaMask.
      if (error.code === 4902) {
        try {
          await ethereum.request({
            method: 'wallet_addEthereumChain',
            params: [{ chainId: '0x'+_chainIdToCompare, rpcUrl: 'https://...' /* ... */ }],
          });
          requestAccountMetamask();
        } catch (addError) {
        }
      }
    }
  }

  const mint = async(mintValue) => {
    if(userAddress == '') {
      return alert('User is not connected');
    }
    
    if(mintValue == 0) { return; }
    setIsLoading(true);
    const provider = await detectEthereumProvider()
  
    if (provider && userAddress!='') {
      const web3 = new Web3(provider);
      
      const contract = new web3.eth.Contract(ContractData.abi, ContractData.address);

      const _priceWei = await contract.methods.getCurrentPrice().call();
      
      // var block = await web3.eth.getBlock("latest");
      // var gasLimit = block.gasLimit/block.transactions.length;
      // const gasPrice = await contract.methods.mint(
      //   mintValue
      // ).estimateGas({from: userAddress, value: (mintValue*_priceWei)});

      await contract.methods.mint(
        mintValue
      ).send({
        from: userAddress,
        value: (mintValue*_priceWei)
      });
      alert('Minted successfuly!');
      setIsLoading(false);
      window.location.reload();
    }
  }


  return (
    <div className={styles.container}>
      <Head>
        <title>Cute Cat Gang</title>
        <meta name="description" content="CCG - 10,000 Cute Cats coming from the metaverse!" />
        <link rel="icon" href="/fvi.png" />
      </Head>
      <nav className={styles.navbar}>
        <img src='/logo2.png'/>
        <ul className={styles.navul}>
          <li><a href='#hero1'>About</a></li>
          <li><a href='#hero3'>Rarity</a></li>
          <li><a href='#roadmap'>Roadmap</a></li>
          <li><a href='#hero5'>FAQ</a></li>
          <li><a href='#team'>Team</a></li>
        {
          userAddress == '' ?
          <li onClick={async () => {
            connectMetamaskPressed();
          }} className={styles.connect_nav}><a><img src='./n_12px-MetaMask_Foxsvg.png'/> Connect Wallet</a></li> :
          <li className={styles.connect_nav}><a><img src='./n_12px-MetaMask_Foxsvg.png'/> {userAddress.substring(0,8)}</a></li>
        }
        </ul>
      </nav>
      <main className={styles.main}>
        <div id='hero1' className={styles.hero1}>
          <img className={styles.hero1img} src='/jeje.png'/>
          <div className={styles.hero1_dialogbox}>
            <div className={styles.hero1dialog}>
              10001 Cats have escaped from Wonderland, and are looking for an adopter to take care of them in the metaverse. <br/><br/>Remember they are still from a gang... be careful.
            </div>
            <Countdown date={1632150000000}  renderer={renderer} />
            
          </div>
        </div>
        <div id='hero2' className={styles.hero2}>
          <img  src='/weeb/Grupo 3.svg'/>
          <img className={styles.arrow_rotate}  src='/weeb/Trazado 33.svg'/>
          <img  src='/banana.gif'/>
        </div>
        <h1 style={{color:'#F4C474',fontSize:'1.2em',fontFamily:'Berlin Sans A'}}>Rarities will be revealed after soldout</h1>
        <div id='hero3' className={styles.hero3}>
          <div className={styles.hero3_item}  onClick={()=>{if(traits!=13){setTraits(0)}else{setTraits(0)}}}>
            Left Hand Object
            <span>
              8
            </span>
                        {traits==13 ? <div className={styles.hero3_extend}>
                            <div className={styles.traititem}>
                              <span>1.50%</span>
                              <span>Blood knife</span>
                            </div>
                            <div className={styles.traititem}>
                              <span>1.76%</span>
                              <span>Cactus</span>
                            </div>
                            <div className={styles.traititem}>
                              <span>1.58%</span>
                              <span>Donut</span>
                            </div>
                            <div className={styles.traititem}>
                              <span>1.43%</span>
                              <span>Drink</span>
                            </div>
                            <div className={styles.traititem}>
                              <span>1.91%</span>
                              <span>Fishing Rod</span>
                            </div>
                            <div className={styles.traititem}>
                              <span>1.80%</span>
                              <span>Lollipop</span>
                            </div>
                            <div className={styles.traititem}>
                              <span>1.61%</span>
                              <span>Mouse</span>
                            </div>
                            <div className={styles.traititem}>
                              <span>1.62%</span>
                              <span>Wand</span>
                            </div>
                          </div>:''}
          </div>

          <div className={styles.hero3_item}  onClick={()=>{if(traits!=12){setTraits(0)}else{setTraits(0)}}}>Body Colour<span>28</span>
            {traits==12 ? <div className={styles.hero3_extend}>
                            <div className={styles.traititem}>
                              <span>6.31%</span>
                              <span>Aqua</span>
                            </div>
                            <div className={styles.traititem}>
                              <span>1.95%</span>
                              <span>Blue</span>
                            </div>
                            <div className={styles.traititem}>
                              <span>4.18%</span>
                              <span>Dark Aqua</span>
                            </div>
                            <div className={styles.traititem}>
                              <span>1.82%</span>
                              <span>Dark Red</span>
                            </div>
                            <div className={styles.traititem}>
                              <span>2.08%</span>
                              <span>Dark Green</span>
                            </div>
                            <div className={styles.traititem}>
                              <span>1.88%</span>
                              <span>Dark Gray</span>
                            </div>
                            <div className={styles.traititem}>
                              <span>3.65%</span>
                              <span>Dark Yellow</span>
                            </div>
                            <div className={styles.traititem}>
                              <span>3.69%</span>
                              <span>Fuchsia</span>
                            </div>
                            <div className={styles.traititem}>
                              <span>4.15%</span>
                              <span>Green</span>
                            </div>
                            <div className={styles.traititem}>
                              <span>5.84%</span>
                              <span>Light Blue</span>
                            </div>
                            <div className={styles.traititem}>
                              <span>1.86%</span>
                              <span>Light Green</span>
                            </div>
                            <div className={styles.traititem}>
                              <span>2.28%</span>
                              <span>Light Skin</span>
                            </div>
                            <div className={styles.traititem}>
                              <span>2.54%</span>
                              <span>Tangerine</span>
                            </div>
                            <div className={styles.traititem}>
                              <span>1.94%</span>
                              <span>Red</span>
                            </div>
                            <div className={styles.traititem}>
                              <span>1.90%</span>
                              <span>Light Yellow</span>
                            </div>
                            <div className={styles.traititem}>
                              <span>2.28%</span>
                              <span>Green Aqua</span>
                            </div>
                            <div className={styles.traititem}>
                              <span>1.94%</span>
                              <span>Peach</span>
                            </div>
                            <div className={styles.traititem}>
                              <span>4.46%</span>
                              <span>Turqoise</span>
                            </div>
                            <div className={styles.traititem}>
                              <span>2.21%</span>
                              <span>Light Pink</span>
                            </div>
                            <div className={styles.traititem}>
                              <span>3.76%</span>
                              <span>Yellow</span>
                            </div>
                            <div className={styles.traititem}>
                              <span>3.98%</span>
                              <span>Lila</span>
                            </div>
                            <div className={styles.traititem}>
                              <span>2.09%</span>
                              <span>Magenta</span>
                            </div>
                            <div className={styles.traititem}>
                              <span>6.15%</span>
                              <span>Orange</span>
                            </div>
                            <div className={styles.traititem}>
                              <span>1.87%</span>
                              <span>Lighty blue</span>
                            </div>
                            <div className={styles.traititem}>
                              <span>3.63%</span>
                              <span>Pink</span>
                            </div>
                            <div className={styles.traititem}>
                              <span>3.81%</span>
                              <span>Pinky</span>
                            </div>
                            <div className={styles.traititem}>
                              <span>5.71%</span>
                              <span>Purple</span>
                            </div>
                            <div className={styles.traititem}>
                              <span>3.80%</span>
                              <span>Skin</span>
                            </div>
                            <div className={styles.traititem}>
                              <span>5.77%</span>
                              <span>White</span>
                            </div>
                          </div>:''}
          </div>

          <div className={styles.hero3_item} onClick={()=>{if(traits!=1){setTraits(0)}else{setTraits(0)}}}>Shadows and Spots<span>36</span>
                    {traits==1 ? <div className={styles.hero3_extend}>
                            <div className={styles.traititem}>
                                  <span>2.66%</span>
                                  <span>Cow aqua</span>
                                </div>
                            <div className={styles.traititem}>
                                  <span>2.87%</span>
                                  <span>Cow cyan</span>
                                </div>
                            <div className={styles.traititem}>
                                  <span>2.45%</span>
                                  <span>Cow dark pink</span>
                                </div>
                            <div className={styles.traititem}>
                                  <span>2.56%</span>
                                  <span>Cow green</span>
                                </div>
                            <div className={styles.traititem}>
                                  <span>2.66%</span>
                                  <span>Cow grey</span>
                                </div>
                            <div className={styles.traititem}>
                                  <span>2.74%</span>
                                  <span>Cow lavanda</span>
                                </div>
                            <div className={styles.traititem}>
                                  <span>2.86%</span>
                                  <span>Cow light pink</span>
                                </div>
                            <div className={styles.traititem}>
                                  <span>2.91%</span>
                                  <span>Cow orange</span>
                                </div>
                            <div className={styles.traititem}>
                                  <span>2.61%</span>
                                  <span>Cow pink</span>
                                </div>
                            <div className={styles.traititem}>
                                  <span>2.60%</span>
                                  <span>Cow purple</span>
                                </div>
                            <div className={styles.traititem}>
                                  <span>2.74%</span>
                                  <span>Cow turquoise</span>
                                </div>
                            <div className={styles.traititem}>
                                  <span>2.96%</span>
                                  <span>Cow yellow</span>
                                </div>
                            <div className={styles.traititem}>
                                  <span>2.98%</span>
                                  <span>Rounded fuchsia</span>
                                </div>
                            <div className={styles.traititem}>
                                  <span>2.72%</span>
                                  <span>Rounded green</span>
                                </div>
                            <div className={styles.traititem}>
                                  <span>2.84%</span>
                                  <span>Rounded grey</span>
                                </div>
                            <div className={styles.traititem}>
                                  <span>2.86%</span>
                                  <span>Rounded lavanda</span>
                                </div>
                            <div className={styles.traititem}>
                                  <span>2.92%</span>
                                  <span>Rounded light blue</span>
                                </div>
                            <div className={styles.traititem}>
                                  <span>2.90%</span>
                                  <span>Rounded light pink</span>
                                </div>
                            <div className={styles.traititem}>
                                  <span>2.59%</span>
                                  <span>Rounded lighty blue</span>
                                </div>
                            <div className={styles.traititem}>
                                  <span>2.64%</span>
                                  <span>Rounded orange</span>
                                </div>
                            <div className={styles.traititem}>
                                  <span>2.96%</span>
                                  <span>Rounded purple</span>
                                </div>
                            <div className={styles.traititem}>
                                  <span>2.97%</span>
                                  <span>Rounded red</span>
                                </div>
                            <div className={styles.traititem}>
                                  <span>2.65%</span>
                                  <span>Rounded skin</span>
                                </div>
                            <div className={styles.traititem}>
                                  <span>2.95%</span>
                                  <span>Rounded yellow</span>
                                </div>
                            <div className={styles.traititem}>
                                  <span>2.74%</span>
                                  <span>Spike aqua</span>
                                </div>
                            <div className={styles.traititem}>
                                  <span>2.65%</span>
                                  <span>Spike green</span>
                                </div>
                            <div className={styles.traititem}>
                                  <span>2.60%</span>
                                  <span>Spike grey</span>
                                </div>
                            <div className={styles.traititem}>
                                  <span>3.26%</span>
                                  <span>Spike light blue</span>
                                </div>
                            <div className={styles.traititem}>
                                  <span>2.93%</span>
                                  <span>Spike light pink</span>
                                </div>
                            <div className={styles.traititem}>
                                  <span>2.53%</span>
                                  <span>Spike lila</span>
                                </div>
                            <div className={styles.traititem}>
                                  <span>2.87%</span>
                                  <span>Spike magenta</span>
                                </div>
                            <div className={styles.traititem}>
                                  <span>2.79%</span>
                                  <span>Spike orange</span>
                                </div>
                            <div className={styles.traititem}>
                                  <span>2.61%</span>
                                  <span>Spike pink</span>
                                </div>
                            <div className={styles.traititem}>
                                  <span>2.85%</span>
                                  <span>Spike purple</span>
                                </div>
                            <div className={styles.traititem}>
                                  <span>2.72%</span>
                                  <span>Spike turquoise</span>
                                </div>
                            <div className={styles.traititem}>
                                  <span>2.86%</span>
                                  <span>Spike yellow</span>
                                </div>

                          </div>:''}
          </div>
          <div className={styles.hero3_item} onClick={()=>{if(traits!=2){setTraits(0)}else{setTraits(0)}}}>Cheeks<span>4</span>
              {traits==2 ? <div className={styles.hero3_extend}>
                <div className={styles.traititem}>
                                  <span>25.12%</span>
                                  <span>Fuchsia</span>
                                </div>
                <div className={styles.traititem}>
                                  <span>24.78%</span>
                                  <span>Orange</span>
                                </div>
                <div className={styles.traititem}>
                                  <span>25.32%</span>
                                  <span>Red</span>
                                </div>
                <div className={styles.traititem}>
                                  <span>24.79%</span>
                                  <span>Skin</span>
                                </div>
                          </div>:''}
          </div>
          <div className={styles.hero3_item} onClick={()=>{if(traits!=3){setTraits(0)}else{setTraits(0)}}}>Right Hand Object<span>16</span>
              {traits==3 ? <div className={styles.hero3_extend}>
                        <div className={styles.traititem}>
                                  <span>1.53%</span>
                                  <span>Balloon</span>
                                </div>
                        <div className={styles.traititem}>
                                  <span>1.79%</span>
                                  <span>Bear</span>
                                </div>
                        <div className={styles.traititem}>
                                  <span>1.57%</span>
                                  <span>Broken bottle</span>
                                </div>
                        <div className={styles.traititem}>
                                  <span>1.73%</span>
                                  <span>Candy</span>
                                </div>
                        <div className={styles.traititem}>
                                  <span>1.63%</span>
                                  <span>Dead flower</span>
                                </div>
                        <div className={styles.traititem}>
                                  <span>1.70%</span>
                                  <span>Fish</span>
                                </div>
                        <div className={styles.traititem}>
                                  <span>1.55%</span>
                                  <span>Flower</span>
                                </div>
                        <div className={styles.traititem}>
                                  <span>1.69%</span>
                                  <span>Milk</span>
                                </div>
                        <div className={styles.traititem}>
                                  <span>1.62%</span>
                                  <span>Mug</span>
                                </div>
                        <div className={styles.traititem}>
                                  <span>1.54%</span>
                                  <span>Nail stick</span>
                                </div>
                        <div className={styles.traititem}>
                                  <span>1.55%</span>
                                  <span>Octopus</span>
                                </div>
                        <div className={styles.traititem}>
                                  <span>1.63%</span>
                                  <span>Sceptre</span>
                                </div>
                        <div className={styles.traititem}>
                                  <span>1.89%</span>
                                  <span>Soda</span>
                                </div>
                        <div className={styles.traititem}>
                                  <span>1.50%</span>
                                  <span>Spatula</span>
                                </div>
                        <div className={styles.traititem}>
                                  <span>1.75%</span>
                                  <span>Surrender</span>
                                </div>
                        <div className={styles.traititem}>
                                  <span>1.55%</span>
                                  <span>Wand</span>
                                </div>

                          </div>:''}
          </div>
          <div className={styles.hero3_item} onClick={()=>{if(traits!=4){setTraits(0)}else{setTraits(0)}}}>Hanging Hand Accessory<span>6</span>
              {traits==4 ? <div className={styles.hero3_extend}>
                  <div className={styles.traititem}>
                                  <span>1.98%</span>
                                  <span>Banana</span>
                                </div>
                  <div className={styles.traititem}>
                                  <span>2.14%</span>
                                  <span>Cookie</span>
                                </div>
                  <div className={styles.traititem}>
                                  <span>2.56%</span>
                                  <span>Donut</span>
                                </div>
                  <div className={styles.traititem}>
                                  <span>2.29%</span>
                                  <span>Hamburguer</span>
                                </div>
                  <div className={styles.traititem}>
                                  <span>2.33%</span>
                                  <span>Hot dog</span>
                                </div>
                  <div className={styles.traititem}>
                                  <span>2.20%</span>
                                  <span>Taco</span>
                                </div>
                          </div>:''}
          </div>
          <div className={styles.hero3_item} onClick={()=>{if(traits!=5){setTraits(0)}else{setTraits(0)}}}>Head Accessory<span>14</span>
                    {traits==5 ? <div className={styles.hero3_extend}>
                            
                                <div className={styles.traititem}>
                                  <span>2.74%</span>
                                  <span>Bufoon</span>
                                </div>
                                <div className={styles.traititem}>
                                  <span>2.91%</span>
                                  <span>Crown</span>
                                </div>
                                <div className={styles.traititem}>
                                  <span>2.60%</span>
                                  <span>Duck</span>
                                </div>
                                <div className={styles.traititem}>
                                  <span>3.08%</span>
                                  <span>Eyebrow Panda</span>
                                </div>
                                <div className={styles.traititem}>
                                  <span>2.83%</span>
                                  <span>Galley</span>
                                </div>
                                <div className={styles.traititem}>
                                  <span>2.79%</span>
                                  <span>Mexican</span>
                                </div>
                                <div className={styles.traititem}>
                                  <span>2.93%</span>
                                  <span>Panda</span>
                                </div>
                                <div className={styles.traititem}>
                                  <span>2.91%</span>
                                  <span>Pig</span>
                                </div>
                                <div className={styles.traititem}>
                                  <span>3.03%</span>
                                  <span>Pirate</span>
                                </div>
                                <div className={styles.traititem}>
                                  <span>2.80%</span>
                                  <span>Purple Galley</span>
                                </div>
                                <div className={styles.traititem}>
                                  <span>2.82%</span>
                                  <span>Red Party</span>
                                </div>
                                <div className={styles.traititem}>
                                  <span>2.74%</span>
                                  <span>Sailor</span>
                                </div>
                                <div className={styles.traititem}>
                                  <span>2.89%</span>
                                  <span>Unicorn Horn</span>
                                </div>
                                <div className={styles.traititem}>
                                  <span>2.69%</span>
                                  <span>Yellow Party</span>
                                </div>
                            
                          </div>:''}
          </div>
          <div className={styles.hero3_item} onClick={()=>{if(traits!=6){setTraits(0)}else{setTraits(0)}}}>Shirt<span>41</span>
              {traits==6 ? <div className={styles.hero3_extend}>
                                <div className={styles.traititem}>
                                  <span>2.64%</span>
                                  <span>Baby Collar</span>
                                </div>
                                <div className={styles.traititem}>
                                  <span>2.45%</span>
                                  <span>Blue Frog</span>
                                </div>
                                <div className={styles.traititem}>
                                  <span>2.48%</span>
                                  <span>Blue Icecream</span>
                                </div>
                                <div className={styles.traititem}>
                                  <span>2.25%</span>
                                  <span>Blue Pizza</span>
                                </div>
                                <div className={styles.traititem}>
                                  <span>2.39%</span>
                                  <span>Flat Fuchsia</span>
                                </div>
                                <div className={styles.traititem}>
                                  <span>2.52%</span>
                                  <span>Flat Green</span>
                                </div>
                                <div className={styles.traititem}>
                                  <span>2.67%</span>
                                  <span>Flat Pink</span>
                                </div>
                                <div className={styles.traititem}>
                                  <span>2.28%</span>
                                  <span>Flat Yellow</span>
                                </div>
                                <div className={styles.traititem}>
                                  <span>2.50%</span>
                                  <span>Frog</span>
                                </div>
                                <div className={styles.traititem}>
                                  <span>2.60%</span>
                                  <span>Green Alien</span>
                                </div>
                                <div className={styles.traititem}>
                                  <span>2.46%</span>
                                  <span>Lavanda</span>
                                </div>
                                <div className={styles.traititem}>
                                  <span>2.61%</span>
                                  <span>Light blue alien</span>
                                </div>
                                <div className={styles.traititem}>
                                  <span>2.50%</span>
                                  <span>Light blue anchor</span>
                                </div>
                                <div className={styles.traititem}>
                                  <span>2.60%</span>
                                  <span>Light blue broken heart</span>
                                </div>
                                <div className={styles.traititem}>
                                  <span>2.51%</span>
                                  <span>Light blue lines</span>
                                </div>
                                <div className={styles.traititem}>
                                  <span>2.32%</span>
                                  <span>Light blue panda</span>
                                </div>
                                <div className={styles.traititem}>
                                  <span>2.37%</span>
                                  <span>Light blue</span>
                                </div>
                                <div className={styles.traititem}>
                                  <span>2.30%</span>
                                  <span>Light pink broken heart</span>
                                </div>
                                <div className={styles.traititem}>
                                  <span>2.28%</span>
                                  <span>Light pink duck</span>
                                </div>
                                <div className={styles.traititem}>
                                  <span>2.29%</span>
                                  <span>Lila sailor</span>
                                </div>
                                <div className={styles.traititem}>
                                  <span>2.10%</span>
                                  <span>Lila</span>
                                </div>
                                <div className={styles.traititem}>
                                  <span>2.32%</span>
                                  <span>Orange duck</span>
                                </div>
                                <div className={styles.traititem}>
                                  <span>2.46%</span>
                                  <span>Pink baby collar</span>
                                </div>
                                <div className={styles.traititem}>
                                  <span>2.38%</span>
                                  <span>Pink broken heart</span>
                                </div>
                                <div className={styles.traititem}>
                                  <span>2.56%</span>
                                  <span>Pink icecream</span>
                                </div>
                                <div className={styles.traititem}>
                                  <span>2.50%</span>
                                  <span>Pink lines</span>
                                </div>
                                <div className={styles.traititem}>
                                  <span>2.64%</span>
                                  <span>Pink Poker Face</span>
                                </div>
                                <div className={styles.traititem}>
                                  <span>2.66%</span>
                                  <span>Pink Rainbow</span>
                                </div>
                                <div className={styles.traititem}>
                                  <span>2.37%</span>
                                  <span>Pink Sailor</span>
                                </div>
                                <div className={styles.traititem}>
                                  <span>2.35%</span>
                                  <span>Pinky Rainbow</span>
                                </div>
                                <div className={styles.traititem}>
                                  <span>2.41%</span>
                                  <span>Pizza</span>
                                </div>
                                <div className={styles.traititem}>
                                  <span>2.51%</span>
                                  <span>Red Anchor</span>
                                </div>
                                <div className={styles.traititem}>
                                  <span>2.49%</span>
                                  <span>Red Duck</span>
                                </div>
                                <div className={styles.traititem}>
                                  <span>2.45%</span>
                                  <span>Red Panda</span>
                                </div>
                                <div className={styles.traititem}>
                                  <span>2.37%</span>
                                  <span>Red Poker</span>
                                </div>
                                <div className={styles.traititem}>
                                  <span>2.36%</span>
                                  <span>Red Alien</span>
                                </div>
                                <div className={styles.traititem}>
                                  <span>2.33%</span>
                                  <span>Skin Baby Collar</span>
                                </div>
                                <div className={styles.traititem}>
                                  <span>2.54%</span>
                                  <span>White Sailor</span>
                                </div>
                                <div className={styles.traititem}>
                                  <span>2.24%</span>
                                  <span>Yellow Anchor</span>
                                </div>
                                <div className={styles.traititem}>
                                  <span>2.46%</span>
                                  <span>Yellow icecream</span>
                                </div>
                                <div className={styles.traititem}>
                                  <span>2.49%</span>
                                  <span>Yellow panda</span>
                                </div>
                              </div>:''}
          </div>
          <div className={styles.hero3_item} onClick={()=>{if(traits!=7){setTraits(0)}else{setTraits(0)}}}>Boots<span>13</span>                        {traits==7 ? <div className={styles.hero3_extend}>
                            <div className={styles.traititem}>
                              <span>8.19%</span>
                              <span>Baby Red</span>
                            </div>
                            <div className={styles.traititem}>
                              <span>7.43%</span>
                              <span>Cyan</span>
                            </div>
                            <div className={styles.traititem}>
                              <span>7.58%</span>
                              <span>Dark Green</span>
                            </div>
                            <div className={styles.traititem}>
                              <span>7.60%</span>
                              <span>Fuchsia</span>
                            </div>
                            <div className={styles.traititem}>
                              <span>7.72%</span>
                              <span>Grey</span>
                            </div>
                            <div className={styles.traititem}>
                              <span>7.97%</span>
                              <span>Light Blue</span>
                            </div>
                            <div className={styles.traititem}>
                              <span>7.83%</span>
                              <span>Light Green</span>
                            </div>
                            <div className={styles.traititem}>
                              <span>7.65%</span>
                              <span>Light Orange</span>
                            </div>
                            <div className={styles.traititem}>
                              <span>7.72%</span>
                              <span>Orange</span>
                            </div>
                            <div className={styles.traititem}>
                              <span>7.44%</span>
                              <span>Pink</span>
                            </div>
                            <div className={styles.traititem}>
                              <span>7.54%</span>
                              <span>Red</span>
                            </div>
                            <div className={styles.traititem}>
                              <span>8.02%</span>
                              <span>Skin</span>
                            </div>
                            <div className={styles.traititem}>
                              <span>7.32%</span>
                              <span>Yellow</span>
                            </div></div>:''}
          </div>
          <div className={styles.hero3_item} onClick={()=>{if(traits!=8){setTraits(0)}else{setTraits(0)}}}>Eyes<span>9</span>{traits==8 ? <div className={styles.hero3_extend}>
                            <div className={styles.traititem}>
                                <span>11.00%</span>
                                <span>Angry</span>
                              </div>
                              <div className={styles.traititem}>
                                <span>11.70%</span>
                                <span>Asian</span>
                              </div>
                              <div className={styles.traititem}>
                                <span>10.97%</span>
                                <span>Closed</span>
                              </div>
                              <div className={styles.traititem}>
                                <span>11.01%</span>
                                <span>Crying</span>
                              </div>
                              <div className={styles.traititem}>
                                <span>11.08%</span>
                                <span>Eyebrows</span>
                              </div>
                              <div className={styles.traititem}>
                                <span>11.12%</span>
                                <span>Eyelash</span>
                              </div>
                              <div className={styles.traititem}>
                                <span>10.85%</span>
                                <span>Normal</span>
                              </div>
                              <div className={styles.traititem}>
                                <span>10.67%</span>
                                <span>Wink</span>
                              </div>
                              <div className={styles.traititem}>
                                <span>11.61%</span>
                                <span>Xx</span>
                              </div>
                            </div>:''}
          </div>

          <div className={styles.hero3_item} onClick={()=>{if(traits!=9){setTraits(0)}else{setTraits(0)}}}>Mouth<span>9</span>{traits==9 ? <div className={styles.hero3_extend}>
                            <div className={styles.traititem}>
                                <span>10.55%</span>
                                <span>Afraid</span>
                              </div>
                              <div className={styles.traititem}>
                                <span>10.98%</span>
                                <span>Happy</span>
                              </div>
                              <div className={styles.traititem}>
                                <span>11.14%</span>
                                <span>Kiss</span>
                              </div>
                              <div className={styles.traititem}>
                                <span>11.32%</span>
                                <span>Poker</span>
                              </div>
                              <div className={styles.traititem}>
                                <span>11.23%</span>
                                <span>Sad</span>
                              </div>
                              <div className={styles.traititem}>
                                <span>11.31%</span>
                                <span>Scared</span>
                              </div>
                              <div className={styles.traititem}>
                                <span>11.06%</span>
                                <span>Slobber</span>
                              </div>
                              <div className={styles.traititem}>
                                <span>10.96%</span>
                                <span>U</span>
                              </div>
                              <div className={styles.traititem}>
                                <span>11.46%</span>
                                <span>W</span>
                              </div>
                            </div>:''}
          </div>

          <div className={styles.hero3_item} onClick={()=>{if(traits!=10){setTraits(0)}else{setTraits(0)}}}>Ultra Rare Accessory<span>3</span>
                        {traits==10 ? <div className={styles.hero3_extend}>
                            <div className={styles.traititem}>
                              <span>1.18%</span>
                              <span>Face Tattoo</span>
                            </div>
                            <div className={styles.traititem}>
                              <span>1.32%</span>
                              <span>Face Tattoo</span>
                            </div>
                            <div className={styles.traititem}>
                              <span style={{padding:'1em 0.2em'}}>97.50%</span>
                              <span>None</span>
                            </div>
                          </div>:''}
          </div>

          <div className={styles.hero3_item} onClick={()=>{if(traits!=11){setTraits(0)}else{setTraits(0)}}}>
            Background
            <span>
              28
            </span>
            {traits==11 ? <div className={styles.hero3_extend}>
                            <div className={styles.traititem}>
                                  <span>3.94%</span>
                                  <span>Afternoon</span>
                                </div>
                                <div className={styles.traititem}>
                                  <span>3.40%</span>
                                  <span>Aqua</span>
                                </div>
                                <div className={styles.traititem}>
                                  <span>3.65%</span>
                                  <span>Aqudot</span>
                                </div>
                                <div className={styles.traititem}>
                                  <span>3.89%</span>
                                  <span>Aqugrey</span>
                                </div>
                                <div className={styles.traititem}>
                                  <span>3.82%</span>
                                  <span>Barbie</span>
                                </div>
                                <div className={styles.traititem}>
                                  <span>3.53%</span>
                                  <span>Candy</span>
                                </div>
                                <div className={styles.traititem}>
                                  <span>3.73%</span>
                                  <span>Clouds</span>
                                </div>
                                <div className={styles.traititem}>
                                  <span>3.30%</span>
                                  <span>Darkness</span>
                                </div>
                                <div className={styles.traititem}>
                                  <span>3.97%</span>
                                  <span>Fly</span>
                                </div>
                                <div className={styles.traititem}>
                                  <span>3.40%</span>
                                  <span>Fruit</span>
                                </div>
                                <div className={styles.traititem}>
                                  <span>3.36%</span>
                                  <span>Greenqua</span>
                                </div>
                                <div className={styles.traititem}>
                                  <span>3.64%</span>
                                  <span>Ken</span>
                                </div>
                                <div className={styles.traititem}>
                                  <span>3.27%</span>
                                  <span>Lemon</span>
                                </div>
                                <div className={styles.traititem}>
                                  <span>3.96%</span>
                                  <span>Lime</span>
                                </div>
                                <div className={styles.traititem}>
                                  <span>3.16%</span>
                                  <span>Lollipop</span>
                                </div>
                                <div className={styles.traititem}>
                                  <span>3.53%</span>
                                  <span>Marshmellow</span>
                                </div>
                                <div className={styles.traititem}>
                                  <span>3.54%</span>
                                  <span>Melon</span>
                                </div>
                                <div className={styles.traititem}>
                                  <span>3.43%</span>
                                  <span>Orange</span>
                                </div>
                                <div className={styles.traititem}>
                                  <span>3.61%</span>
                                  <span>Peach</span>
                                </div>
                                <div className={styles.traititem}>
                                  <span>3.53%</span>
                                  <span>Pinky</span>
                                </div>
                                <div className={styles.traititem}>
                                  <span>3.50%</span>
                                  <span>Ponk</span>
                                </div>
                                <div className={styles.traititem}>
                                  <span>3.84%</span>
                                  <span>Purple</span>
                                </div>
                                <div className={styles.traititem}>
                                  <span>3.35%</span>
                                  <span>Sky</span>
                                </div>
                                <div className={styles.traititem}>
                                  <span>3.37%</span>
                                  <span>Toy</span>
                                </div>
                                <div className={styles.traititem}>
                                  <span>3.37%</span>
                                  <span>Violet</span>
                                </div>
                                <div className={styles.traititem}>
                                  <span>3.74%</span>
                                  <span>Water</span>
                                </div>
                                <div className={styles.traititem}>
                                  <span>3.65%</span>
                                  <span>Wonder</span>
                                </div>
                                <div className={styles.traititem}>
                                  <span>3.53%</span>
                                  <span>Zamba</span>
                                </div>
                          </div>:''}
          </div>
        </div>
        <div id='hero4' className={styles.hero4} style={{fontSize:'0.5em'}}>
            <h1>Contract: 0x053281ce1da15023d19aacc843cec96b78e4d2ce</h1>
        </div>
        <div id='roadmap' className={styles.hero4}>
        <h1>Roadmap</h1>
            <div>
              <h3>25%</h3>
              <p>We will airdrop 10 Cat NFTs to 10 random holders listed. The snapshot will be taking place once we get to 25% minted, so if you sell your cat before you wont get a reward!</p>
            </div>
            <div>
              <h3>50%</h3>
              <p>We will donate 4eth of the earnings to a local Cat Shelter we already partnered with to take care of the abandoned and abused cats.</p>
              <p>Airdrop 20 Cat NFTs to 10 random holders.</p>
            </div>
            <div>
              <h3>75%</h3>
              <p>Creation of CCG Token which will be rewarded to holders, and will let you exchange it for new gen2 CCGs and CCG t-shirts!</p>
            </div>
            <div>
              <h3>100% </h3>
              <p>Cute Cat Gang gen2 - Breeding system, with new cats, animations and much more!</p>
              <p>A Big Surprise. Stay tuned!</p>
            </div>
        </div>
        <div className={styles.gallery}>
            <img src='/260.png'/>
            <img src='/261.png'/>
            <img src='/262.png'/>
            <img src='/263.png'/>
            <img src='/264.png'/>
            <img src='/265.png'/>
            <img src='/266.png'/>
            <img src='/267.png'/>
            <img src='/268.png'/>
            <img src='/269.png'/>
        </div>
        <div id='hero4' className={styles.hero4}>
          <h1>Frequently Asked Questions</h1>
            <div>
              <h3>Why Should i buy a Cute Gang Cat?</h3>
              <p>First, because they are adorable, second because they take care of you from another gang, third because they are up for adoption and need parents and lastly, because we will be ??????growing the community and adding different features like breeding and airdrops to holders in the future.</p>
            </div>
            <div>
              <h3>When does official minting start?</h3>
              <p>Monday 20th of September, at 15hs UTC.</p>
            </div>
            <div>
              <h3>How does the minting work?</h3>
              <p>You click on connect wallet, choose your wallet of preference, and after that you just click mint, it costs 0.042</p>
            </div>
            <div>
              <h3>When and Where can i see my Cute Cat Gang NFTs?</h3>
              <p>They will all be revealed after minting, you will also be able to see it at Opensea.</p>
            </div>
            <div>
              <h3>How rare is mew cat, how do i put value to it?</h3>
              <p>You can see just above the FAQ section a list of trait rarities, but we will also put the gang on Rarity Sniper Discord, if you get a cat with rare parts it will be mewxpensive.</p>
            </div>
            <div>
              <h3>When you launch Breeding, will my cat lose exclusivity?</h3>
              <p>No, after introducing the breeding system, you will have an even more exclusive cat, since some of their features wont be available for Gen 2 of the Cats Gang.</p>
            </div>
        </div>
        <h1 id='team' className={styles.teamtitle}>Team</h1>
        <div id='hero6' className={styles.hero6}>
          <div>
            <img src='/268.png'/>
            <p>@Nacho_Carrera</p>
            <p>Designer</p>
          </div>
          <div>
            <img src='/269.png'/>
            <p>@CurtiNico</p>
            <p>Developer</p>
          </div>
          <div>
            <img src='/270.png'/>
            <p>PandasYKiwis</p>
            <p>Illustrator</p>
          </div>
        </div>
        <div id='hero5' className={styles.hero5}>
          <a href='https://discord.gg/vn5wF4n5XX'><img  src='/weeb/Trazado 47.svg'/></a>
          <a href='https://twitter.com/cutecatgang'><img  src='/weeb/Trazado 48.svg'/></a>
          <img src='/weeb/Grupo 60.svg'/>
        </div>
      </main>
    </div>
  )
}
