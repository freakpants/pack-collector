import Card from "@mui/material/Card";
import CardMedia from "@mui/material/CardMedia";
import GoldPack from "./packs/gold.webp";
import RarePack from "./packs/rare.webp";
import { Component } from "react";
class Pack extends Component {
  render() {
    let imageLink = "";
    const {image, name, coin_value, fp} = this.props.pack;
    switch (image) {
        case "gold":
            imageLink = GoldPack;
            break;
        case "rare":
            imageLink = RarePack;
            break;
    }
    return (
      <Card className={"pack"}>
        <h1>{name}</h1>
        <CardMedia
          component="img"
          image={imageLink}
          style={{width: "200px"}}
        />

        {coin_value} Coins<br/>
        {fp} Fifa Points
      </Card>
    );
  }
}
export default Pack;
