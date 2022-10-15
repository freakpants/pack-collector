import React, { Component } from "react";
import { createTheme, ThemeProvider } from "@mui/material/styles";
import axios from "axios";
import { Grid, TextField } from "@mui/material";
import Pack from "./Pack";

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
    };
    this.handleChange = this.handleChange.bind(this);
    this.updateTotals = this.updateTotals.bind(this);
  }

  componentDidMount() {
    const localPacks = localStorage.getItem("packs");
    // get packs
    axios
      .get(process.env.REACT_APP_AJAXSERVER + "getPacks.php")
      .then((response) => {
        // add untradeable and tradeable = 0 for every pack
        response.data.forEach((pack) => {
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

        this.setState({ packs: response.data, allPacks: response.data });
        this.updateTotals();
      })
      .catch((error) => {
        console.log(error);
      });
  }

  handleChange(e){
    this.setState({packSearch: e.target.value});
    // filter the pack list by packs that have the search term in their name
    // set state on packs
    this.setState({packs: this.state.allPacks.filter((pack) => pack.name.toLowerCase().includes(e.target.value.toLowerCase()))});

  }

  countUpdate = (packId, count, tradeable) => {
    // update the count of a pack
    // get the pack
    const pack = this.state.packs.find((pack) => pack.id === packId);
    // update the count
    if(tradeable){
      pack.tradeable = count;
    }else{
      pack.untradeable = count;
    }
    // update the state
    this.setState({ packs: this.state.packs });
    localStorage.setItem("packs", JSON.stringify(this.state.packs));

    this.updateTotals();

  };

  updateTotals(){
        // loop all tradeable pack counts and add them together
        let tradeablePacks = 0;
        this.state.packs.forEach((pack) => {
          tradeablePacks += pack.tradeable;
        }); 
    
        this.setState({tradeablePacks: tradeablePacks});
    
        // loop all untradeable pack counts and add them together
        let untradeablePacks = 0;
        this.state.packs.forEach((pack) => {
          untradeablePacks += pack.untradeable;
        }
        );
    
        this.setState({untradeablePacks: untradeablePacks});

        // calculate total packs
        this.setState({totalPacks: tradeablePacks + untradeablePacks});

        // calculate total coins
        let totalCoins = 0;
        this.state.packs.forEach((pack) => {
          totalCoins += (pack.tradeable + pack.untradeable) * pack.coin_value;
        }
        );

        this.setState({totalCoins: totalCoins});

        // calculate total fp
        let totalFP = 0;
        this.state.packs.forEach((pack) => {
          totalFP += (pack.tradeable + pack.untradeable) * pack.fp;
        }
        );

        this.setState({totalFP: totalFP});


        
        // 12000 fp => 8999 EuroCents
        let fpToEuro = 8999 / 12000;

        // calculate total cash
        this.setState({totalCash: Math.floor((totalFP * fpToEuro))  / 100});
        

        


  }

  render() {
    const theme = createTheme({
      typography: {
        fontFamily: "Matroska",
        fontSize: 12,
      },
    });


    return (
      <ThemeProvider theme={theme}>
        <div id="top"></div>
        <div id="bottom"></div>
        <Grid container>
          <Grid item xs={12}>
            <h1>FUT 23 Pack Collector</h1>
          </Grid>
        </Grid>
        <Grid container>
          <Grid item xs={12} className={"statsline"}>
            Untradeable Packs: {this.state.untradeablePacks} | Tradeable Packs: {this.state.tradeablePacks} | Total Packs: {this.state.totalPacks}  <br/>
            Total Coins: {this.state.totalCoins} | Total FP: {this.state.totalFP} | Total Cash: {this.state.totalCash} € / {Math.floor(this.state.totalCash * 0.97 * 100)/100} $ / {Math.floor(this.state.totalCash * 0.87 * 100)/100} £
          </Grid>
        </Grid>
        <Grid container>
          <Grid item xs={12}>
            <TextField value={this.state.packSearch} id="outlined-basic" label="filter by name" variant="outlined" onChange={this.handleChange} onBlur={() => this.props.actions.updateInput(this.state.inputValue)} />
          </Grid>
        </Grid>
         <Grid container>
          {this.state.packs.map((pack) => (
            <Grid key={pack.id} item xs={2}>
              <Pack onCountUpdate={this.countUpdate} pack={pack}/>
            </Grid>
          ))}
        </Grid>
      </ThemeProvider>
    );
  }
}
export default App;
