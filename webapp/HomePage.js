import React from "react";

import {
    lookupAddress,
    getAddressList,
    getURLCount,
    getURL,
    sendETH,
    bid,
    DnsContractAddress
} from "./dns.js"

class HomePage extends React.Component {
    constructor(props) {
        super(props);
        this.state = {

            // States for Entering Auction House
            domainName: "",

            // States for Looking Up Owner of Domain
            searchingDomainName: "no",
            lookedUpDomainName: "", // Dynamic two way binding domain name search
            searchedDomainName: "", // Only changes when "search" is pressed

            // States for Looking Up Domains for an Owner
            address: "0x0", // Dynamic two way binding eth address search
            searchedAddress: "", // Only changes when "search" is pressed
            domainNameOwner: "",
            domainsOwned: [],

            // States for Sending ETH to a Domain
            domainForETH: "",
            ethInput: 0,
            domainNotFound: false,

            mockItems: {
                "0x1": ["scse.ntu"],
                "0x2": ["mae.ntu"],
                "0x3": ["wkw.ntu", "nbs.ntu"],
                "0x4": ["stars.ntu"],
                "0x5": ["adm.ntu", "rep.ntu"],
            },

            data: {}

        };
    }

    // Handlers for Entering Auction House 

    handleDomainName = event => {
        this.setState({
            domainName: event.target.value
        })
    }

    enterAuctionHouse = () => {
        // // Error Handling for Domain Names
        // if (this.state.domainName === "") {
        //     window.alert("Please input a domain name!");
        // } else if (!this.state.domainName.includes('.')) {
        //     window.alert("Please input a valid domain name!");
        // } else {
        //     // Routing and Passing of Domain Params into Auction House
        //     const queryString = "domainName=" + encodeURIComponent(this.state.domainName);

        //     this.props.history.push({
        //         pathname: '/auction',
        //         search: '?' + queryString
        //     });
        // }

        // Entering "/auction" page
        this.props.history.push('/auction');
    }

    // Handlers for Look-up of Owner for Domain

    handleSearchedDomainName = event => {
        this.setState({
            lookedUpDomainName: event.target.value
        })
    }

    handleDomainNameLookup = async () => {
        this.setState({
            searchingDomainName: "yes",
        })

        this.setState({
            searchedDomainName: this.state.lookedUpDomainName
        })

        let result = await lookupAddress(this.state.searchedDomainName);
        this.setState({
            searchingDomainName: "display",
            domainNameOwner: result.ownerAddress,
        })

    }

    // Handlers for Look-up of Domains of an Owner

    handlePublicAddress = event => {
        this.setState({
            address: event.target.value
        })
    }

    handleOwnerLookup = () => {
        const address = this.state.address;

        this.setState({
            searchedAddress: this.state.address,
        })

        if (address === "") {
            this.setState({
                domainsOwned: [],
            })
        }
        else if (!(address in this.state.data)) {
            this.setState({
                domainsOwned: ['Not Found'],
            })
        } else {
            listOfDomains = this.state.data[address]

            this.setState({
                domainsOwned: listOfDomains,
            })
        }

    }

    // Handlers for Sending ETH to a Domain

    handleDomainNameETH = event => {
        this.setState({
            domainForETH: event.target.value
        })
    }

    handleETHInput = (e) => {
        this.setState({ ethInput: e.target.value });
    };

    sendETHtoURL = async () => {
        // Check if domain has an owner
        let result = await lookupAddress(this.state.domainForETH);

        if (result.ownerAddress === "0") {
            window.alert("This domain is not owned by an ETH address!");
        } else {
            sendETH(this.state.ethInput, result.ownerAddress);
        }

        // // For testing purposes only
        // sendETH(this.state.ethInput, this.state.domainForETH);
    }

    componentDidMount() {

        const populateMappingData = async () => {
            // Obtain a list of eth addresses
            let addressList = await getAddressList();

            // Populate a key value mapping of eth addresses to counts of domains owned
            let addressToCountMap = {}
            addressList.forEach(async (ethAddress) => {
                let count = await getURLCount(ethAddress);
                addressToCountMap[ethAddress] = count;
            })

            // Populate a mappings object that contains eth addresses mapped to an array of the domains they own
            mappings = {}

            // For each ethereum address to count mapping
            for (const [key, value] of Object.entries(addressToCountMap)) {
                let domainList = []

                // Based on its count value, we iteratively obtain the domain URL
                // corresponding its index, for a given ethereum address
                for (var i = 0; i < value; i++) {
                    let domainName = await getURL(key, i);
                    domainList.push(domainName);
                }
                // Add the eth address to domain list mapping to the mappings object 
                mappings[key] = domainList;

            }

            // update the state with the new mappings object
            this.setState({
                data: {
                    ...mappings
                }
            })
        }

        populateMappingData();

    }

    render() {

        const cardStyle = {
            fontFamily: "arial",
            width: "80%",
            margin: "16px auto",
            border: "1px solid #eee",
            boxShadow: "0 2px 3px #ccc",
            padding: "15px",
            textAlign: "center",
        };

        const innerCardStyle = {
            // fontFamily: "arial",
            // width: "50%",
            // // margin: "16px auto",
            // border: "1px solid #eee",
            // boxShadow: "0 2px 3px #ccc",
            // // padding: "5px",
            // textAlign: "center",
            flex: 1,
            fontFamily: "arial",

            border: "1px solid #eee",
            boxShadow: "0 2px 3px #ccc",
            textAlign: "center",
        }

        const scroller = {
            margin: "0 auto",
            height: "200px",
            width: "100%",
            overflow: "auto"
        }

        return (
            <>
                <div style={cardStyle}>
                    <img style={{ width: "100px" }} src={require('./assets/auction.png')} />

                    <h1 >DNS Auction House</h1>
                    <p style={{ width: "45%", margin: "auto", fontSize: "18px", marginBottom: "20px" }} >
                        Your one-stop registrar service to bid for domain names, <br />using the <b>Ethereum</b> blockchain!</p>

                </div>
                {/* Routing for Entering the Auction House */}
                <div style={cardStyle}>
                    <img style={{ height: "50px", width: "50px" }} src={require('./assets/house.png')} />

                    <h2>The Auction House</h2>
                    <p style={{ width: "60%", margin: "auto", fontSize: "15px", marginBottom: "20px" }} >
                        Looking to own a new domain name?
                        <br></br>
                        Want to check on the status of an existing auction?
                        <br></br>
                        <br></br>
                        Click below to create or manage your existing auctions.
                        <br></br>
                    </p>

                    {/* <input
                        style={{ width: "40%", margin: "5px" }}
                        type="text"
                        placeholder="Please enter your desired domain name"
                        value={this.state.value}
                        onChange={this.handleDomainName}
                    />
                    <br></br> */}
                    <input style={{ margin: "5px" }} type="submit" value="Enter the Auction House" onClick={this.enterAuctionHouse} />

                </div>

                <div style={{
                    fontFamily: "arial",
                    width: "81%",
                    margin: "auto",
                    display: "flex",
                    flexDirection: "row"
                }}>
                    {/* DNS Look up from URL String -> ETH Address of Owner */}

                    <div style={innerCardStyle}>
                        <img style={{ height: "50px", width: "50px", marginTop: "15px" }} src={require('./assets/ethereum.png')} />
                        <h3>Look-up the Owner of a Domain</h3>

                        <input
                            style={{ width: "60%", margin: "5px" }}
                            type="text"
                            placeholder="Please enter a valid domain name"
                            value={this.state.value}
                            onChange={this.handleSearchedDomainName}
                        />{" "}<br></br>
                        <input style={{ margin: "5px" }} type="submit" value="Search!" onClick={this.handleDomainNameLookup} />
                        <p>
                            {/* If currently searching (async call) for owner of domain */}
                            {this.state.searchingDomainName === "yes"
                                ? "Searching for owner of domain, please wait..."
                                // If page is first loaded, show "Ready!"
                                : (this.state.searchingDomainName === "no"
                                    ? "Ready!"
                                    // If domain name lookup returns "0", owner does not exist
                                    : this.state.domainNameOwner === "0" ? "This domain is currently not owned by anyone."
                                        // Else, show the owner of the domain URL
                                        : this.state.searchedDomainName + "belongs to address " + this.state.ownerAddress)}
                        </p>
                    </div>

                    {/* DNS Look up from URL String -> ETH Address of Owner */}

                    <div style={innerCardStyle}>
                        <img style={{ height: "50px", width: "50px", marginTop: "15px" }} src={require('./assets/ethereum.png')} />
                        <h3> Look-up the Domain(s) of an Owner</h3>
                        <input
                            style={{ width: "60%", margin: "5px" }}
                            type="text"
                            placeholder="Please enter a valid Ethereum Public Address"
                            value={this.state.value}
                            onChange={this.handlePublicAddress}
                        /><br></br>

                        <input style={{ margin: "5px" }} type="submit" value="Search!" onClick={this.handleOwnerLookup} />
                        <p>
                            {this.state.domainsOwned.length === 0
                                ? "Ready!"
                                : this.state.domainsOwned[0] === 'Not Found'
                                    ? this.state.searchedAddress + " does not own any domains."
                                    : this.state.searchedAddress + " owns the following domains: " + this.state.domainsOwned.join(", ")}
                        </p>
                    </div>

                    {/* Sending ETH to a Domain URL */}
                    <div style={innerCardStyle}>
                        <img style={{ height: "50px", width: "50px", marginTop: "15px" }} src={require('./assets/ethereum.png')} />
                        <h3>Send ETH to a Domain</h3>
                        <input
                            style={{ width: "60%", margin: "5px" }}
                            type="text"
                            placeholder="Please enter a valid domain"
                            value={this.state.value}
                            onChange={this.handleDomainNameETH}
                        />
                        <input
                            style={{ width: "60%", margin: "5px" }}
                            type="text"
                            placeholder="Please input the amount to send (in ETH)"
                            value={this.state.value}
                            onChange={this.handleETHInput}
                        />
                        <br></br>

                        <input style={{ margin: "5px" }} type="submit" value="Send!" onClick={this.sendETHtoURL} />
                        <p>
                            {this.state.domainsOwned.length === 0
                                ? "Ready!"
                                : this.state.domainsOwned[0] === 'Not Found'
                                    ? this.state.searchedAddress + " does not own any domains."
                                    : this.state.searchedAddress + " owns the following domains: " + this.state.domainsOwned.join(", ")}
                        </p>
                    </div>

                </div>

                <div style={cardStyle}>
                    <h3>List of Registered Domains</h3>
                    <div style={scroller}>
                        <table style={{
                            borderCollapse: "collapse",
                            border: "2px solid rgb(200, 200, 200)",
                            letterSpacing: "1px",
                            // fontSize: ".8rem"
                            width: "100%"
                        }}>
                            <thead style={{ backgroundColor: "#e4f0f5" }}>
                                <tr>
                                    <th style={{
                                        border: "1px solid rgb(190, 190, 190)",
                                        padding: "5px 10px",
                                    }} scope="col" >Ethereum Address</th>
                                    <th scope="col">Domain Name(s) Owned</th>
                                </tr>
                            </thead>
                            <tbody>
                                {Object.entries(this.state.mockItems).map(([key, value]) => {
                                    return (
                                        <tr>
                                            <th style={{
                                                border: "1px solid rgb(190, 190, 190)",
                                                padding: "5px 10px",
                                            }} scope="row">{key}</th>
                                            <td style={{
                                                border: "1px solid rgb(190, 190, 190)",
                                                padding: "5px 10px", textAlign: "center"
                                            }}>{value.join(', ')}</td>
                                        </tr>
                                    );
                                })}

                            </tbody>
                        </table>
                    </div>
                </div>



            </>
        );
    }
}

export default HomePage;