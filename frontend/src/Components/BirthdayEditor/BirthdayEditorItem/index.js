import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { ItemStatus, StatusColors } from '../../BirthdayEditor';

//@ts-check

export class BirthdayEditorItem extends Component {
  constructor(props) {
    super(props);
  }

  EDIT_ICON = '\u270E';
  DELETE_ICON = '\u2717';
  UNDO_ICON = '\u21a9';
  SAVE_ICON = '\u2713';

  render() {
    const {
      displayName,
      birthday,
      status,
      editMode,
      onEditFocus,
      onDeleteItem,
      onUndoDelete,
      onUndoEdit
    } = this.props;

    return (
      <div ref={this.setRef}>
        {editMode && (
          <div style={{ display: 'inline-flex', width: '35px' }}>
            {status !== ItemStatus.DELETED && (
              <>
                <span
                  style={{
                    color: 'yellow',
                    cursor: 'pointer',
                    marginLeft: '.25em'
                  }}
                  onClick={() => {
                    onEditFocus();
                  }}
                >
                  {this.EDIT_ICON}
                </span>
                {status === ItemStatus.EDITED && (
                  <span
                    style={{
                      color: 'white',
                      cursor: 'pointer',
                      marginLeft: '.25em'
                    }}
                    onClick={onUndoEdit}
                  >
                    {this.UNDO_ICON}
                  </span>
                )}
                {status !== ItemStatus.EDITED && (
                  <span
                    style={{
                      color: 'red',
                      cursor: 'pointer',
                      marginLeft: '.25em'
                    }}
                    onClick={() => {
                      onDeleteItem();
                    }}
                  >
                    {this.DELETE_ICON}
                  </span>
                )}
              </>
            )}
            {status === ItemStatus.DELETED && (
              <span
                style={{
                  color: 'white',
                  cursor: 'pointer',
                  marginLeft: 'auto',
                  marginRight: '0'
                }}
                onClick={onUndoDelete}
              >
                {this.UNDO_ICON}
              </span>
            )}
          </div>
        )}

        <span
          style={{
            marginLeft: '.35em',
            color: `${StatusColors[status]}`
          }}
        >
          {displayName}
        </span>
        <span
          style={{
            color: 'rgb(120, 126, 158)',
            marginLeft: '.5em',
            fontSize: '.9em'
          }}
        >
          {`${convertedBdayString(birthday)}`}
        </span>
      </div>
    );
  }
}

BirthdayEditorItem.propTypes = {
  displayName: PropTypes.string,
  birthday: PropTypes.string,
  status: PropTypes.number,
  editMode: PropTypes.bool,
  onEditFocus: PropTypes.func,
  onDeleteItem: PropTypes.func,
  onUndoDelete: PropTypes.func,
  onSubmitEdit: PropTypes.func,
  onUndoEdit: PropTypes.func
};

BirthdayEditorItem.defaultProps = {
  canEditItem: true,
  editFocused: false
};

const months = Object.freeze({
  '01': 'January',
  '02': 'February',
  '03': 'March',
  '04': 'April',
  '05': 'May',
  '06': 'June',
  '07': 'July',
  '08': 'August',
  '09': 'September',
  '10': 'October',
  '11': 'November',
  '12': 'December'
});

/*
 * str 'YYYYMMDD' --> str <month> DD
 * E.g: '20200220' --> 'February 20'
 */
function convertedBdayString(str) {
  const month = str.slice(0, 2);
  const day = parseInt(str.slice(2)).toString(10); // remove leading zeros, e.g: '01' --> '1'
  return months[month] + ' ' + day;
}
