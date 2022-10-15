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
      <div className={"packs__item"}>
        <div className="packs__item__title">
          <h2>{name}</h2>
        </div>
        <img
          alt={name}          
          className={"packs__item__preview"}
          src={imageLink}
        />
        <div className="packs__item__pricing">
          <span className={"packs__item__pricing__coins"}>{coin_value}</span> | <span className={"packs__item__pricing__points"}>{fp}</span>
        </div>
        <div className="packs__item__counter">
          <div className="packs__item__counter__element">
            Untradeable            
            <div className="packs__item__counter__element__stepper">
                {untradeable > 0 &&
                <button type="button" className="packs__item__counter__element__stepper__decrease"
                  onClick={() => {
                    if(untradeable > 0){
                        onCountUpdate(id, untradeable - 1, false);
                    }
                  }}
                >-</button>
                }
                <span className="packs__item__counter__element__stepper__amount">{untradeable}</span>
                <button type="button" className="packs__item__counter__element__stepper__increase"
                  onClick={() => {
                    onCountUpdate(id, untradeable + 1, false);
                  }}
                >+</button>
            </div>
          </div>
          <div className="packs__item__counter__element">
            Tradeable
            <div className="packs__item__counter__element__stepper">
              {tradeable > 0 &&
              <button type="button" className="packs__item__counter__element__stepper__decrease"
                  onClick={() => {
                      if(tradeable > 0){
                          onCountUpdate(id, tradeable - 1, true);
                      }
                  }}
              >- </button>
              }
              <span className="packs__item__counter__element__stepper__amount">{tradeable}</span>
              <button type="button" className="packs__item__counter__element__stepper__increase"
                  onClick={() => {
                      onCountUpdate(id, tradeable + 1, true);
                  }}
              > +
              </button>                
            </div>
          </div>
        </div>
      </div>
    );
  }
}
export default Pack;
