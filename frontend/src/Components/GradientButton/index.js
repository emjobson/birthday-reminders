import React, { Component } from "react";
import PropTypes from "prop-types";
import styles from "./styles.css";

export class GradientButton extends Component {
  handleClick = () => {
    const { onClick, disabled } = this.props;
    if (!disabled) {
      onClick();
    }
  };

  render() {
    const { text, style } = this.props;
    return (
      <span
        style={style}
        className={styles.buttonBorder}
        onClick={this.handleClick}
      >
        <span className={styles.buttonText}>{text}</span>
      </span>
    );
  }
}

GradientButton.propTypes = {
  onClick: PropTypes.func,
  text: PropTypes.string,
  style: PropTypes.object,
  disabled: PropTypes.bool
};

GradientButton.defaultProps = {
  disabled: false
};
