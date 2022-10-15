import Card from "@mui/material/Card";
import CardMedia from "@mui/material/CardMedia";
import GoldPack from "./packs/gold.webp";
import RarePack from "./packs/rare.webp";
import { Component } from "react";
class Pack extends Component {
  render() {
    let imageLink = "";
    const { id, image, name, coin_value, fp, tradeable, untradeable } =
      this.props.pack;
    const onCountUpdate = this.props.onCountUpdate;
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
          style={{ width: "200px" }}
        />
        {coin_value} Coins
        <br />
        {fp} Fifa Points
        <div className="count-container">
          <div className="count-element">
            Untradeable: <br />
            {untradeable > 0 &&
            <span class="modify-count"
              onClick={() => {
                if(untradeable > 0){
                    onCountUpdate(id, untradeable - 1, false);
                }
              }}
            >- </span>
  }
            {untradeable}
            <span class="modify-count"
              onClick={() => {
                onCountUpdate(id, untradeable + 1, false);
              }}
            > +
            </span>
          </div>
          <div className="count-element">
            Tradeable: <br />
            {tradeable > 0 &&
            <span class="modify-count"
                onClick={() => {
                    if(tradeable > 0){
                        onCountUpdate(id, tradeable - 1, true);
                    }
                }}
            >- </span>
    }
            {tradeable}
            <span class="modify-count"
                onClick={() => {
                    onCountUpdate(id, tradeable + 1, true);
                }}
            > +
            </span>
                
          </div>
        </div>
      </Card>
    );
  }
}
export default Pack;
