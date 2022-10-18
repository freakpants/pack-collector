import GoldPack from "./packs/gold.webp";
import RarePack from "./packs/rare.webp";
import PrimePack from "./packs/prime.webp";
import HeroesPack from "./packs/heroes.png";
import { Component } from "react";
class Pack extends Component {
  render() {
    let imageLink = "";
    const { id, image, name, coin_value, fp, tradeable, untradeable, discard, guaranteed_rating, description } =
      this.props.pack;
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
        
      default:
          break;
    }
    return (
      <div className={"packs__item"}>
        <div className="packs__item__title">
          <h2>{name}</h2>
        </div>
        <div class="packs__item__preview">
          <img
            alt={name}          
            className={"packs__item__preview__img"}
            src={imageLink}
          />
          <div className={"packs__item__preview__data"}>
            <span className={"packs__item__pricing__coins"}>Min Discard: {discard}</span>
            {guaranteed_rating > 0 && (
              <span className={"packs__item__pricing__rating"}>Guaranteed Rating: {guaranteed_rating}</span>
            )}
          </div>
          {description != "" && (
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
