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
    };
    this.handleChange = this.handleChange.bind(this);
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
  };


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
        <TextField value={this.state.packSearch} id="outlined-basic" label="Outlined" variant="outlined" onChange={this.handleChange} onBlur={() => this.props.actions.updateInput(this.state.inputValue)} />
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
