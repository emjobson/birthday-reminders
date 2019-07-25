import React, { Component } from 'react';
import PropTypes from 'prop-types';
import styles from './styles.css';

export default class Section extends Component {
  constructor(props) {
    super(props);
    this.state = {};
  }

  render() {
    return (
      <div
        className={styles.section}
        id={this.props.id}
        style={this.props.style}
      >
        <h1 style={{ color: '#5f92ce' }}>{this.props.title}</h1>
        {this.props.children}
      </div>
    );
  }
}

Section.propTypes = {
  title: PropTypes.string,
  id: PropTypes.string,
  style: PropTypes.object
};
