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
import Twitter from "./assets/twitter.svg";
import GoogleLoginButton from "./assets/btn_google_signin_dark_normal_web.png";
import { FormControlLabel, FormGroup, Checkbox, Button } from "@mui/material";
import GoldPack from "./packs/gold.webp";
import RarePack from "./packs/rare.webp";
import PrimePack from "./packs/prime.webp";
import HeroesPack from "./packs/heroes.png";
import ChampsPack from "./packs/champs.webp";
import { useScreenshot } from "use-react-screenshot";

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
      hideUnassignedMode: false,
      discard: 0,
      totalDiscard: 0,
      user: false,
      packIdsNotFound: [],
    };
    this.handleChange = this.handleChange.bind(this);
    this.updateTotals = this.updateTotals.bind(this);
    this.handleSpreadMode = this.handleSpreadMode.bind(this);
    this.handleUnassignedMode = this.handleUnassignedMode.bind(this);
    this.addDefaultCounts = this.addDefaultCounts.bind(this);
    this.triggerTwitterLogin = this.triggerTwitterLogin.bind(this);
    this.triggerGoogleLogin = this.triggerGoogleLogin.bind(this);
    this.triggerGoogleLogout = this.triggerGoogleLogout.bind(this);
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
      databaseURL:
        "https://pack-collector-default-rtdb.europe-west1.firebasedatabase.app/",
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
    let localPacks = localStorage.getItem("packs");
    localPacks = JSON.parse(localPacks);
    // add untradeable and tradeable = 0 for every pack
    packs.forEach((pack) => {
      // look for the pack in localpacks
      if (localPacks && localPacks.length > 0) {
        const localPack = localPacks.find(
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
          // if the url has pack counts, go through them and add them
          const urlParams = new URLSearchParams(window.location.search);
          const packCounts = urlParams.get("packs");
          if (packCounts) {
            // set all pack counts to 0
            this.state.packs.forEach((pack) => {
              this.countUpdate(pack.id, 0, false);
              this.countUpdate(pack.id, 0, true);
            });

            const urlPacks = packCounts.split("-");
            urlPacks.forEach((pack) => {
              const packSplit = pack.split(",");
              let eaId = packSplit[0];
              const untradeable = parseInt(packSplit[1]);
              const tradeable = parseInt(packSplit[2]);

              switch (eaId) {
                case "513":
                  eaId = "1213";
                  break;
                case "8601":
                  eaId = "6308";
                  break;
                case "8602":
                  eaId = "309";
                  break;
                case "8603":
                  eaId = "313";
                  break;
                case "8604":
                  eaId = "727";
                  break;
                case "8605":
                  eaId = "2212";
                  break;
                case "8606":
                  eaId = "6402";
                  break;
                case "8607":
                  eaId = "6403";
                  break;
                case "8608":
                  eaId = "5404";
                  break;
                case "8609":
                  eaId = "6518";
                  break;
                case "8611":
                  eaId = "6315";
                  break;
                case "8613":
                  eaId = "6405";
                  break;
                default:
                  break;
                
              }

              console.log("looking for pack with ea_id: " + eaId);

              // filter packs, get the pack with the eaId
              const packToUpdate = packs.find((pack) => pack.ea_id === eaId);

              if (packToUpdate) {
                console.log("updating " + packToUpdate.name);
                this.countUpdate(packToUpdate.id, untradeable, false);
                this.countUpdate(packToUpdate.id, tradeable, true);
              } else {
                // if the pack has 4 digits and the first digit is 6, try to find the pack with the last 3 digits
                console.log("length of eaid is " + eaId.length);
                console.log("first digit is " + eaId[0]);
                if (eaId.length === "4" && (eaId[0] === "6" || eaId[0] === "8")) {
                  const shortie = eaId.substring(1, 4);
                  console.log("looking for pack with ea_id: " + shortie);
                  const packToUpdate = packs.find(
                    (pack) => pack.ea_id === eaId.substring(1, 4)
                  );
                  if (packToUpdate) {
                    console.log("updating " + packToUpdate.name);
                    // get the previous counts
                    const previousPack = this.state.packs.find(
                      (pack) => pack.id === packToUpdate.id
                    );
                    this.countUpdate(
                      packToUpdate.id,
                      untradeable + previousPack.untradeable,
                      false
                    );
                    this.countUpdate(
                      packToUpdate.id,
                      tradeable + previousPack.tradeable,
                      true
                    );
                  } else {
                    console.log("pack not found");
                    // add to the list of packs that are not found
                    let packIdsNotFound = this.state.packIdsNotFound;
                    // push to array
                    packIdsNotFound.push(eaId);

                    this.setState({
                      packIdsNotFound: packIdsNotFound,
                    });
                  }
                } else {
                  console.log("pack not found");
                  // add to the list of packs that are not found
                  let packIdsNotFound = this.state.packIdsNotFound;
                  // push to array
                  packIdsNotFound.push(eaId);

                  this.setState({
                    packIdsNotFound: packIdsNotFound,
                  });
                }
              }
            });
          }
          this.updateTotals();
        });
      });
  }

  handleChange(e) {
    this.setState({ packSearch: e.target.value });
    // filter the pack list by packs that have the search term in their name
    // modify packs so that not found packs have the state of hidden

    // set state on packs

    this.setState({
      packs: this.state.allPacks.filter((pack) => {
        if (pack.name.toLowerCase().includes(e.target.value.toLowerCase())) {
          pack.hidden = false;
        } else {
          pack.hidden = true;
        }
        return pack;
      }),
    });
  }

  handleSpreadMode(e) {
    this.setState({ spreadSheetMode: e.target.checked });
  }

  handleUnassignedMode(e) {
    this.setState({ hideUnassignedMode: e.target.checked });
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
      case "champs":
        imageLink = ChampsPack;
        break;
      default:
        break;
    }
    return imageLink;
  }

  countUpdate = (packId, count, tradeable) => {
    console.log("updating " + packId + " with " + count + " " + tradeable);
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

  triggerGoogleLogout() {
    this.auth.signOut();
  }

  savePacks() {
    // save the packs to the database
    /* axios.post(process.env.REACT_APP_AJAXSERVER + "savePacks.php", {packs: this.state.packs, user: this.state.user } )
    .then(response => {
      console.log(response);
    }) */
    set(ref(this.database, "packs/" + this.state.user.uid), this.state.packs);
  }

  loadPacks() {
    // load the packs from the database
    const packsRef = ref(this.database, "packs/" + this.state.user.uid);
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

    let filteredPacks;  
    // if spreadsheet mode, filter packs
    if(this.state.spreadSheetMode && this.state.hideUnassignedMode) {
      filteredPacks = this.state.packs.filter((pack) => {
        return pack.untradeable > 0 || pack.tradeable > 0;
      }
      );
    } else {
      filteredPacks = this.state.packs;
    }

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
        <div className={"logo"}>
          <img className={"logo__img"} src={Logo} alt="FUT23 Pack Collector" />
          <div className={"logo__twitter"}>
            <a
              href="https://twitter.com/FUTCoder"
              rel="noreferrer"
              target="_blank"
            >
              <img alt="Twitter Logo" src={Twitter} /> FUT Coder
            </a>{" "}
            x{" "}
            <a
              href="https://twitter.com/Kimpembro"
              rel="noreferrer"
              target="_blank"
            >
              <img alt="Twitter Logo" src={Twitter} /> Kimpembro
            </a>
          </div>
        </div>
        {!this.state.user && (
          <img
            className={"googleLogin"}
            alt="Google Login"
            onClick={this.triggerGoogleLogin}
            src={GoogleLoginButton}
          />
        )}
        {this.state.user && (
          <div className={"cloudArea"}>
            <div className={"displayName"}>
              Logged in as {this.state.user.displayName}
            </div>
            <div className={"cloudButtons"}>
              <Button onClick={this.triggerGoogleLogout} variant="contained">
                Logout
              </Button>
              <Button onClick={this.savePacks} variant="contained">
                Save Packs
              </Button>
              <Button onClick={this.loadPacks} variant="contained">
                Load Packs
              </Button>
            </div>
          </div>
        )}
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
              {this.state.totalCoins.toLocaleString("de-CH")}
            </span>
          </div>
          <div className={"statistics__item"}>
            <span className={"statistics__item__header"}>Minimum Discard</span>
            <span className={"statistics__item__value statistics__item__coins"}>
              {this.state.totalDiscard.toLocaleString("de-CH")}
            </span>
          </div>
          <div className={"statistics__item"}>
            <span className={"statistics__item__header"}>Total FP</span>
            <span
              className={"statistics__item__value statistics__item__points"}
            >
              {this.state.totalFP.toLocaleString("de-CH")}
            </span>
          </div>
          <div className={"statistics__item"}>
            <span className={"statistics__item__header"}>Total Cash</span>
            <span className={"statistics__item__value"}>
              €{this.state.totalCash.toLocaleString("de-CH")} / $
              {(
                Math.floor(this.state.totalCash * 1.08 * 100) / 100
              ).toLocaleString("de-CH")}{" "}
              / £
              {(
                Math.floor(this.state.totalCash * 0.89 * 100) / 100
              ).toLocaleString("de-CH")}{" "}
              / CHF
              {(
                Math.floor(this.state.totalCash * 1.01 * 100) / 100
              ).toLocaleString("de-CH")}
            </span>
          </div>
        </div>
        {this.state.packIdsNotFound.length > 0 && (
          <div className={"packsNotFound"}>
            <span className={"packsNotFound__header"}>
              The following packs were not found, please report this to FUTCoder
              on Twitter:
            </span>
            <span className={"packsNotFound__list"}>
              &nbsp;{this.state.packIdsNotFound.join(", ")}
            </span>
          </div>
        )}
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
            <div>            <FormControlLabel
              control={<Checkbox onChange={this.handleSpreadMode} />}
              label="Spreadsheet Mode"
            /><FormControlLabel
              control={<Checkbox onChange={this.handleUnassignedMode} />}
              label="Hide Empty Packs"
            /></div>

          </FormGroup>
        </div>
        {!this.state.spreadSheetMode && (
          <div className={"packs"}>
            {this.state.packs.map((pack) => (
              <Pack
                key={pack.id}
                onCountUpdate={this.countUpdate}
                hideUnassignedMode={this.state.hideUnassignedMode}
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
                {filteredPacks.map((pack) => (
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

export function Screenshot() {
  const [image, takeScreenshot] = useScreenshot();
  const getImage = () => takeScreenshot(ref.current);
  const width = 300;
  return (
    <div>
      <div>
        <button style={{ marginBottom: "10px" }} onClick={getImage}>
          Take screenshot
        </button>
      </div>
      <img width={width} src={image} alt={"Screenshot"} />
      <div ref={ref}></div>
    </div>
  );
}
