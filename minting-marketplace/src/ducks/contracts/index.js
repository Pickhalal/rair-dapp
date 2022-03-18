import * as types from './types';

import * as ethers from 'ethers'

import { minterAbi, factoryAbi, erc777Abi, diamondFactoryAbi, diamondMarketplaceAbi } from '../../contracts';

const contractAddresses = {
	'0x38': { // Binance Mainnet
		factory: '0xc76c3ebEA0aC6aC78d9c0b324f72CA59da36B9df',
		erc777: '0x0Ce668D271b8016a785Bf146e58739F432300B12',
		minterMarketplace: '0xC9eF9902fa24923A17326aDdb7da0E67fF46692a',
		diamondFactory: process.env.REACT_APP_DIAMONDS_ENABLED === 'true' && '0x556a3Db6d800AAA56f8B09E476793c5100705Db5',
		diamondMarketplace: process.env.REACT_APP_DIAMONDS_ENABLED === 'true' && '0x92FBe344513e108B581170E73CFA352B729E47EA'
	},
	'0x61': { // Binance Testnet
		factory: '0x2b5ed3C018DA72270C3C30003C8d5affdBB9F7f5',
		erc777: '0x5b01aBE2DCfaa4C9c80ccE87223c8e21D7Fc9845',
		minterMarketplace: '0xcBA6014452e82eBF98fA2748BBD46f1733a13AdD',
		diamondFactory: process.env.REACT_APP_DIAMONDS_ENABLED === 'true' && '0xA2c57691b8DF0D8479f5f888c69346363D23a49F',
		diamondMarketplace: process.env.REACT_APP_DIAMONDS_ENABLED === 'true' && '0xaCb13B4c527eD6237f7DB6E95Ef71929d1e13DD6'
	},
	'0x5': { // Ethereum Goerli
		factory: '0xe1BBd1d2B2B52042CC3B766Fb72AA2804e402B2e',
		erc777: '0x4e6a5B076730954d80e55dDb2d2e7E732B5bAb70',
		minterMarketplace: '0x14ef15A945b6Cae28f4FA3862E41d74E484Cd3B5',
		diamondFactory: process.env.REACT_APP_DIAMONDS_ENABLED === 'true' && '0xEF85370b8F136E2F28eA904bF0dA5acac3D1d74f',
		diamondMarketplace: process.env.REACT_APP_DIAMONDS_ENABLED === 'true' && '0x6B3c06b39Aa1ADe73c625b184326d4837c7a2b64'
	},
	'0x13881': { // Matic Mumbai
		factory: '0x2E8DC5Bc8523Bd129dc770908b41c5c2c22d4AdD',
		erc777: '0x1AeAb89553233D1045b506e8DCBFa3df76E18896',
		minterMarketplace: '0x4594D508cDa05D016571082d467889f4629e1f56',
		diamondFactory: process.env.REACT_APP_DIAMONDS_ENABLED === 'true' && '0xbB236Ce48dDCb58adB8665E220FE976bA5d080a5',
		diamondMarketplace: process.env.REACT_APP_DIAMONDS_ENABLED === 'true' && '0x2c8BA9f098CD319a971cE2705F26723c81044Cb0'
	},
	'0x89': { // Matic Mainnet
		factory: '0x701931758cB94F9AA684e13f710F5e4B85Bb94F2',
		erc777: '0x0Ce668D271b8016a785Bf146e58739F432300B12',
		minterMarketplace: '0x781F15a23506CF28539EA057e3f33008E6339E49',
		diamondFactory: process.env.REACT_APP_DIAMONDS_ENABLED === 'true' && '0x9498b23e964760364435C23c793e9352Ff4E2200',
		diamondMarketplace: process.env.REACT_APP_DIAMONDS_ENABLED === 'true' && '0x51eA5316F2A9062e1cAB3c498cCA2924A7AB03b1'
	},
	'0x1': { // Ethereum Mainnet
		factory: '0xba01BC9Ea4f2806ADdcd94C6cd8c43DD4f2488eC',
		erc777: '0xf0ebe73fdae61b305132fd1873c98fb5c4735b40',
		minterMarketplace: '0x0Ce668D271b8016a785Bf146e58739F432300B12',
		diamondFactory: undefined,
		diamondMarketplace: undefined
	}
}

const InitialState = {
	minterInstance: undefined,
	factoryInstance: undefined,
	erc777Instance: undefined,
	diamondFactoryInstance: undefined,
	diamondMarketplaceInstance: undefined,
	currentChain: undefined,
	currentUserAddress: undefined,
	programmaticProvider: undefined,
	contractCreator: undefined,
	realChain: undefined
};

export default function userStore(state = InitialState, action) {
	switch (action.type) {
		case types.SET_CHAIN_ID:
			if (contractAddresses[action.payload] !== undefined) {
				let signer;
				if (window.ethereum) {
					let provider = new ethers.providers.Web3Provider(window.ethereum);
					provider.on('debug', ({ action, request, response, provider }) => {
						if (process.env.REACT_APP_LOG_WEB3 === 'true') {
							console.log(response ? 'Receiving response to' : 'Sending request', request.method);
						}
					})
					signer = provider.getSigner(0);
				} else if (state.programmaticProvider) {
					signer = state.programmaticProvider;
				} else {
					return {
						...state,
						currentChain: action.payload,
						web3Provider: undefined,
						minterInstance: undefined,
						factoryInstance: undefined,
						erc777Instance: undefined,
						contractCreator: undefined,
						diamondFactoryInstance: undefined,
						diamondMarketplaceInstance: undefined,
					}
				}
				const contractCreator = (address, abi) => {
					if (address) {
						return new ethers.Contract(address, abi, signer);
					}
					return undefined;
				}
				return {
					...state,
					currentChain: action.payload,
					factoryInstance: contractCreator(contractAddresses[action.payload].factory, factoryAbi),
					minterInstance: contractCreator(contractAddresses[action.payload].minterMarketplace, minterAbi),
					erc777Instance: contractCreator(contractAddresses[action.payload].erc777, erc777Abi),
					diamondFactoryInstance: contractCreator(contractAddresses[action.payload].diamondFactory, diamondFactoryAbi),
					diamondMarketplaceInstance: contractCreator(contractAddresses[action.payload].diamondMarketplace, diamondMarketplaceAbi),
					contractCreator: contractCreator
				}
			} else {
				return {
					...state,
					currentChain: action.payload,
					minterInstance: undefined,
					factoryInstance: undefined,
					erc777Instance: undefined,
					contractCreator: undefined,
					diamondFactoryInstance: undefined,
					diamondMarketplaceInstance: undefined,
				}
			}
		case types.SET_USER_ADDRESS:
			return {
				...state,
				currentUserAddress: action.payload
			};
		case types.SET_PROGRAMMATIC_PROVIDER:
			return {
				...state,
				programmaticProvider: action.payload
			};
		case types.SET_REAL_CHAIN:
			return {
				...state,
				realChain: action.payload
			}
		default:
			return state;
	}
}
