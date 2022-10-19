// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import {
  GoogleAuthProvider,
  getAuth,
  signInWithRedirect,
  getRedirectResult,
  onAuthStateChanged,
} from "firebase/auth";
import { getDatabase, set, ref, onValue } from "firebase/database";

import React, { Component } from "react";
import { createTheme, ThemeProvider } from "@mui/material/styles";
import axios from "axios";
import Pack from "./Pack";
import Logo from "./assets/logopc.png";
import { FormControlLabel, FormGroup, Checkbox, Button } from "@mui/material";
import GoldPack from "./packs/gold.webp";
import RarePack from "./packs/rare.webp";
import PrimePack from "./packs/prime.webp";
import HeroesPack from "./packs/heroes.png";

class App extends Component {
  constructor(props) {
    super(props);
    this.state = {
      packs: [],
      allPacks: [],
      untradeablePacks: 0,
      tradeablePacks: 0,
      totalPacks: 0,
      totalCoins: 0,
      totalPlayers: 0,
      totalFP: 0,
      totalCash: 0,
      spreadSheetMode: false,
      discard: 0,
      totalDiscard: 0,
      user: false,
    };
    this.handleChange = this.handleChange.bind(this);
    this.updateTotals = this.updateTotals.bind(this);
    this.handleSpreadMode = this.handleSpreadMode.bind(this);
    this.addDefaultCounts = this.addDefaultCounts.bind(this);
    this.triggerTwitterLogin = this.triggerTwitterLogin.bind(this);
    this.triggerGoogleLogin = this.triggerGoogleLogin.bind(this);
    this.savePacks = this.savePacks.bind(this);
    this.loadPacks = this.loadPacks.bind(this);

    // Your web app's Firebase configuration
    // For Firebase JS SDK v7.20.0 and later, measurementId is optional
    const firebaseConfig = {
      apiKey: "AIzaSyBZjAp5aWnUV9y_AbI0UeN8fMSco9L7U3U",
      authDomain: "pack-collector.firebaseapp.com",
      projectId: "pack-collector",
      storageBucket: "pack-collector.appspot.com",
      messagingSenderId: "935679710199",
      appId: "1:935679710199:web:906c3ac232f7d9fecf54f2",
      measurementId: "G-60T2BG3K5X",
      databaseURL: "https://pack-collector-default-rtdb.europe-west1.firebasedatabase.app/",
    };

    const fireApp = initializeApp(firebaseConfig);
    const analytics = getAnalytics(fireApp);
    this.analytics = analytics;

    this.database = getDatabase(fireApp);

    this.GoogleAuthProvider = new GoogleAuthProvider();

    // this.provider = new TwitterAuthProvider();
    this.auth = getAuth();

    onAuthStateChanged(this.auth, (user) => {
      if (user) {
        // User is signed in, see docs for a list of available properties
        // https://firebase.google.com/docs/reference/js/firebase.User
        // write user object to local storage
        localStorage.setItem("user", JSON.stringify(user));

        this.setState({ user: user });
      } else {
        // User is signed out
        localStorage.setItem("user", JSON.stringify(user));

        this.setState({ user: false });
      }
    });

  }

  addDefaultCounts(packs) {
    const localPacks = localStorage.getItem("packs");
    // add untradeable and tradeable = 0 for every pack
    packs.forEach((pack) => {
      // look for the pack in localpacks
      if (localPacks) {
        const localPack = JSON.parse(localPacks).find(
          (localPack) => localPack.id === pack.id
        );
        if (localPack && localPack.untradeable !== null) {
          pack.untradeable = localPack.untradeable;
        } else {
          pack.untradeable = 0;
        }
        if (localPack && localPack.tradeable !== null) {
          pack.tradeable = localPack.tradeable;
        } else {
          pack.tradeable = 0;
        }
      } else {
        pack.untradeable = 0;
        pack.tradeable = 0;
      }
    });
    return packs;
  }

  componentDidMount() {
    // get the redirected user
    getRedirectResult(this.auth)
      .then((result) => {
        // This gives you a Google Access Token. You can use it to access Google APIs.
        // const credential = GoogleAuthProvider.credentialFromResult(result);
        // const token = credential.accessToken;

        // The signed-in user info.
        const user = result.user;

        // write user object to local storage
        localStorage.setItem("user", JSON.stringify(user));

        this.setState({ user: user });
      })
      .catch((error) => {
        // Handle Errors here.
        // const errorCode = error.code;
        const errorMessage = error.message;

        console.log(errorMessage);
      });

    // get the players from the json file
    let packs = require("./Packs.json");
    packs = this.addDefaultCounts(packs);

    this.setState({ packs: packs, allPacks: packs }, () => {
      this.updateTotals();
    });
    // get packs
    axios
      .get(process.env.REACT_APP_AJAXSERVER + "getPacks.php")
      .then((response) => {
        const packs = this.addDefaultCounts(response.data);
        console.log(packs);
        this.setState({ packs: packs, allPacks: packs }, () => {
          this.updateTotals();
        });
      });
  }

  handleChange(e) {
    this.setState({ packSearch: e.target.value });
    // filter the pack list by packs that have the search term in their name
    // set state on packs
    this.setState({
      packs: this.state.allPacks.filter((pack) =>
        pack.name.toLowerCase().includes(e.target.value.toLowerCase())
      ),
    });
  }

  handleSpreadMode(e) {
    this.setState({ spreadSheetMode: e.target.checked });
  }

  getPackIcon(pack) {
    let imageLink = "";
    switch (pack.image) {
      case "gold":
        imageLink = GoldPack;
        break;
      case "rare":
        imageLink = RarePack;
        break;
      case "prime":
        imageLink = PrimePack;
        break;
      case "heroes":
        imageLink = HeroesPack;
        break;

      default:
        break;
    }
    return imageLink;
  }

  countUpdate = (packId, count, tradeable) => {
    // update the count of a pack
    // get the pack
    const pack = this.state.packs.find((pack) => pack.id === packId);
    // update the count
    if (tradeable) {
      pack.tradeable = count;
    } else {
      pack.untradeable = count;
    }
    // update the state
    this.setState({ packs: this.state.packs });
    localStorage.setItem("packs", JSON.stringify(this.state.packs));

    this.updateTotals();
  };

  updateTotals() {
    // loop all tradeable pack counts and add them together
    let tradeablePacks = 0;
    this.state.packs.forEach((pack) => {
      tradeablePacks += pack.tradeable;
    });

    this.setState({ tradeablePacks: tradeablePacks });

    // loop all untradeable pack counts and add them together
    let untradeablePacks = 0;
    this.state.packs.forEach((pack) => {
      untradeablePacks += pack.untradeable;
    });

    this.setState({ untradeablePacks: untradeablePacks });

    // calculate total packs
    this.setState({ totalPacks: tradeablePacks + untradeablePacks });

    // calculate total coins
    let totalCoins = 0;
    this.state.packs.forEach((pack) => {
      totalCoins += (pack.tradeable + pack.untradeable) * pack.coin_value;
    });

    this.setState({ totalCoins: totalCoins });

    // calculate total discard
    let totalDiscard = 0;
    this.state.packs.forEach((pack) => {
      totalDiscard += pack.tradeable * pack.discard;
    });

    this.setState({ totalDiscard: totalDiscard });

    // calculate total fp
    let totalFP = 0;
    this.state.packs.forEach((pack) => {
      totalFP += (pack.tradeable + pack.untradeable) * pack.fp;
    });

    this.setState({ totalFP: totalFP });

    // 12000 fp => 8999 EuroCents
    let fpToEuro = 8999 / 12000;

    // calculate total cash
    this.setState({ totalCash: Math.floor(totalFP * fpToEuro) / 100 });
  }

  triggerTwitterLogin() {
    signInWithRedirect(this.auth, this.provider);
  }

  triggerGoogleLogin() {
    signInWithRedirect(this.auth, this.GoogleAuthProvider);
  }

  savePacks(){
    // save the packs to the database
    /* axios.post(process.env.REACT_APP_AJAXSERVER + "savePacks.php", {packs: this.state.packs, user: this.state.user } )
    .then(response => {
      console.log(response);
    }) */
    set(ref(this.database, 'packs/' + this.state.user.uid), this.state.packs);
  }

  loadPacks(){
    // load the packs from the database
    const packsRef = ref(this.database, 'packs/' + this.state.user.uid);
    onValue(packsRef, (snapshot) => {
      const data = snapshot.val();

      this.setState({ packs: data, allPacks: data }, () => {
        this.updateTotals();
      });
      // save packs to local storage too
      localStorage.setItem("packs", JSON.stringify(data));
    });
  }

  render() {
    const theme = createTheme({
      typography: {
        fontFamily: "Matroska",
        fontSize: 12,
        color: "#F8EEDE",
      },
    });

    /*
            <img
          onClick={this.triggerTwitterLogin}
          src={
            "https://cdn.cms-twdigitalassets.com/content/dam/developer-twitter/auth-docs/sign-in-with-twitter-gray.png.twimg.1920.png"
          }
        />
        */

    return (
      <ThemeProvider theme={theme}>
        {!this.state.user && (
          <img
            alt="Google Login"
            onClick={this.triggerGoogleLogin}
            src={
              "https://developers.google.com/static/identity/images/btn_google_signin_dark_normal_web.png"
            }
          />
        )}
        {this.state.user && (
          <div className={"cloudArea"}>
            <div className={"displayName"}>
              Logged in as {this.state.user.displayName}
            </div>
            <div><Button onClick={this.savePacks} variant="contained">Save Packs</Button>
            <Button onClick={this.loadPacks} variant="contained">Load Packs</Button></div>
          </div>
        )}

        <div className={"logo"}>
          <img className={"logo__img"} src={Logo} alt="FUT23 Pack Collector" />
        </div>
        <div className={"statistics"}>
          <div className={"statistics__item"}>
            <span className={"statistics__item__header"}>Untradeable</span>
            <span className={"statistics__item__value"}>
              {this.state.untradeablePacks} packs
            </span>
          </div>
          <div className={"statistics__item"}>
            <span className={"statistics__item__header"}>Tradeable</span>
            <span className={"statistics__item__value"}>
              {this.state.tradeablePacks} packs
            </span>
          </div>
          <div className={"statistics__item"}>
            <span className={"statistics__item__header"}>Total</span>
            <span className={"statistics__item__value"}>
              {this.state.totalPacks} packs
            </span>
          </div>
          <div className={"statistics__item"}>
            <span className={"statistics__item__header"}>Total Coins</span>
            <span className={"statistics__item__value statistics__item__coins"}>
              {this.state.totalCoins}
            </span>
          </div>
          <div className={"statistics__item"}>
            <span className={"statistics__item__header"}>Minimum Discard</span>
            <span className={"statistics__item__value statistics__item__coins"}>
              {this.state.totalDiscard}
            </span>
          </div>
          <div className={"statistics__item"}>
            <span className={"statistics__item__header"}>Total FP</span>
            <span
              className={"statistics__item__value statistics__item__points"}
            >
              {this.state.totalFP}
            </span>
          </div>
          <div className={"statistics__item"}>
            <span className={"statistics__item__header"}>Total Cash</span>
            <span className={"statistics__item__value"}>
              €{this.state.totalCash} / $
              {Math.floor(this.state.totalCash * 0.97 * 100) / 100} / £
              {Math.floor(this.state.totalCash * 0.87 * 100) / 100}
            </span>
          </div>
        </div>
        <div className="filter">
          <FormGroup>
            <input
              value={this.state.packSearch}
              id="outlined-basic"
              label="filter by name"
              variant="outlined"
              placeholder="Search for a specific pack..."
              onChange={this.handleChange}
              onBlur={() =>
                this.props.actions.updateInput(this.state.inputValue)
              }
            />
            <FormControlLabel
              control={<Checkbox onChange={this.handleSpreadMode} />}
              label="Spreadsheet Mode"
            />
          </FormGroup>
        </div>
        {!this.state.spreadSheetMode && (
          <div className={"packs"}>
            {this.state.packs.map((pack) => (
              <Pack
                key={pack.id}
                onCountUpdate={this.countUpdate}
                pack={pack}
              />
            ))}
          </div>
        )}

        {this.state.spreadSheetMode && (
          <div className={"spreadsheet"}>
            <table className={"packs-table"}>
              <thead>
                <tr>
                  <th>Pack</th>
                  <th>Untradeable</th>
                  <th>Tradeable</th>

                  <th>Total</th>
                  <th>Coins</th>
                  <th>Discard</th>
                  <th>Min</th>
                  <th>FP</th>
                  <th>Cash</th>
                </tr>
              </thead>
              <tbody>
                {this.state.packs.map((pack) => (
                  <tr>
                    <td className={"nameCell"}>
                      <div>
                        <img
                          alt="smallPacks"
                          className={"smallPacks"}
                          src={this.getPackIcon(pack)}
                        />
                      </div>
                      <div className={"packName"}>{pack.name}</div>
                    </td>
                    <td>
                      {" "}
                      <div className="packs__item__counter__element__stepper">
                        {pack.untradeable > 0 && (
                          <button
                            type="button"
                            className="packs__item__counter__element__stepper__decrease"
                            onClick={() => {
                              if (pack.untradeable > 0) {
                                this.countUpdate(
                                  pack.id,
                                  pack.untradeable - 1,
                                  false
                                );
                              }
                            }}
                          >
                            -
                          </button>
                        )}
                        <span className="packs__item__counter__element__stepper__amount">
                          {pack.untradeable}
                        </span>
                        <button
                          type="button"
                          className="packs__item__counter__element__stepper__increase"
                          onClick={() => {
                            this.countUpdate(
                              pack.id,
                              pack.untradeable + 1,
                              false
                            );
                          }}
                        >
                          +
                        </button>
                      </div>
                    </td>
                    <td>
                      <div className="packs__item__counter__element__stepper">
                        {pack.tradeable > 0 && (
                          <button
                            type="button"
                            className="packs__item__counter__element__stepper__decrease"
                            onClick={() => {
                              if (pack.tradeable > 0) {
                                this.countUpdate(
                                  pack.id,
                                  pack.tradeable - 1,
                                  true
                                );
                              }
                            }}
                          >
                            -
                          </button>
                        )}
                        <span className="packs__item__counter__element__stepper__amount">
                          {pack.tradeable}
                        </span>
                        <button
                          type="button"
                          className="packs__item__counter__element__stepper__increase"
                          onClick={() => {
                            this.countUpdate(pack.id, pack.tradeable + 1, true);
                          }}
                        >
                          +
                        </button>
                      </div>
                    </td>

                    <td>{pack.tradeable + pack.untradeable}</td>
                    <td>
                      {pack.coin_value * (pack.tradeable + pack.untradeable)}
                    </td>
                    <td>{pack.discard * pack.tradeable}</td>
                    <td>
                      {pack.guaranteed_rating > 0 && pack.guaranteed_rating}
                    </td>
                    <td>{pack.fp * (pack.tradeable + pack.untradeable)}</td>
                    <td>
                      {Math.floor(
                        (pack.fp * (pack.tradeable + pack.untradeable) * 8999) /
                          12000
                      ) / 100}
                    </td>
                  </tr>
                ))}
                <tr>
                  <td>Total</td>
                  <td>{this.state.tradeablePacks}</td>
                  <td>{this.state.untradeablePacks}</td>
                  <td>{this.state.totalPacks}</td>
                  <td>{this.state.totalCoins}</td>
                  <td>{this.state.totalDiscard}</td>
                  <td>N/A</td>
                  <td>{this.state.totalFP}</td>
                  <td>{this.state.totalCash}</td>
                </tr>
              </tbody>
            </table>
          </div>
        )}
      </ThemeProvider>
    );
  }
}
export default App;
