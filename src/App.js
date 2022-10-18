import React, { Component } from "react";
import { createTheme, ThemeProvider } from "@mui/material/styles";
import axios from "axios";
import Pack from "./Pack";
import Logo from "./assets/logopc.png";
import { FormControlLabel, FormGroup, Checkbox } from "@mui/material";

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
    };
    this.handleChange = this.handleChange.bind(this);
    this.updateTotals = this.updateTotals.bind(this);
    this.handleSpreadMode = this.handleSpreadMode.bind(this);
    this.addDefaultCounts = this.addDefaultCounts.bind(this);
  }

  addDefaultCounts(packs) {
    const localPacks = localStorage.getItem("packs");
    // add untradeable and tradeable = 0 for every pack
    packs.forEach((pack) => {
      console.log(localPacks);
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

  render() {
    const theme = createTheme({
      typography: {
        fontFamily: "Matroska",
        fontSize: 12,
        color: "#F8EEDE",
      },
    });

    return (
      <ThemeProvider theme={theme}>
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
                  <th>Tradeable</th>
                  <th>Untradeable</th>
                  <th>Total</th>
                  <th>Coins</th>
                  <th>FP</th>
                  <th>Cash</th>
                </tr>
              </thead>
              <tbody>
                {this.state.packs.map((pack) => (
                  <tr>
                    <td>{pack.name}</td>
                    <td>{pack.tradeable}</td>
                    <td>{pack.untradeable}</td>
                    <td>{pack.tradeable + pack.untradeable}</td>
                    <td>
                      {pack.coin_value * (pack.tradeable + pack.untradeable)}
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
