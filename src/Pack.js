import GoldPack from "./packs/gold.webp";
import RarePack from "./packs/rare.webp";
import PrimePack from "./packs/prime.webp";
import HeroesPack from "./packs/heroes.png";
import ChampsPack from "./packs/champs.webp";
import { Component } from "react";
class Pack extends Component {
  render() {
    let imageLink = "";
    const { hidden, id, image, name, tradeable, untradeable, guaranteed_rating, description} =
      this.props.pack;

    const hideUnassignedMode = this.props.hideUnassignedMode;

    let { discard, coin_value, fp } = this.props.pack;
    // cast to int
    discard = parseInt(discard);
    coin_value = parseInt(coin_value);
    fp = parseInt(fp);

    discard = discard.toLocaleString("de-CH");
    coin_value = coin_value.toLocaleString("de-CH");
    fp = fp.toLocaleString("de-CH");

    if (hidden || (hideUnassignedMode && untradeable === 0 && tradeable === 0)) {
      return null;
    }
    const onCountUpdate = this.props.onCountUpdate;
    switch (image) {
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

    return (
      <div className={"packs__item"}>
        <div className="packs__item__title">
          <h2>{name}</h2>
        </div>
        <div className={"packs__item__preview"}>
          <img
            alt={name}          
            className={"packs__item__preview__img"}
            src={imageLink}
            width={"252px"}
            height={"366px"}
          />
          <div className={"packs__item__preview__data"}>
            <span className={"packs__item__pricing__coins"}>Min Discard: {discard}</span>
            {guaranteed_rating > 0 && (
              <span className={"packs__item__pricing__rating"}>Guaranteed Rating: {guaranteed_rating}</span>
            )}
          </div>
          {description !== "" && (
          <div className={"packs__item__preview__description"}>
            <span>{description}</span>
          </div>
          )}
        </div>
        <div className="packs__item__pricing">
          <span className={"packs__item__pricing__coins"}>{coin_value}</span> | <span className={"packs__item__pricing__points"}>{fp}</span><br/>
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
