import React, { Component } from "react";
import { createTheme, ThemeProvider } from "@mui/material/styles";

class App extends Component {
  constructor(props) {
    super(props);
    this.state = {
      packs: [],
    };
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
      </ThemeProvider>
    );
  }
}
export default App;
