import React, { Component } from "react";
import PropTypes from "prop-types";
import styles from "./styles.css";
import { ItemStatus, StatusColors } from "../../BirthdayEditor";

export class BirthdayEditorItem extends Component {
  constructor(props) {
    super(props);
    this.state = {
      editName: ""
    };
  }

  EDIT_ICON = "\u270E";
  DELETE_ICON = "\u2717";
  UNDO_ICON = "\u21a9";
  SAVE_ICON = "\u2713";

  render() {
    const {
      idx,
      name,
      birthday,
      status,
      canEditItem, // true if editor in edit mode AND (this item selected, or no items selected)
      onEditFocus,
      editFocused, // whether or not the current item is in edit focused mode
      onEditItem, // callback that expects (oldName, newName, birthday) // TODO: delete this
      onDeleteItem,
      onUndoDelete,
      onSubmitEdit, // TODO: create callback that modifies editedItem in parent-parent
      onUndoEdit
    } = this.props;

    const { editName } = this.state;

    return (
      <div>
        {/* Editor in editMode and no item is in editFocus --> show delete and edit icons */}
        {canEditItem && !editFocused && status !== ItemStatus.DELETED && (
          <>
            <span
              style={{
                color: "yellow",
                cursor: "pointer",
                marginLeft: ".25em"
              }}
              onClick={() => {
                this.setState({ editName: name });
                onEditFocus();
              }}
            >
              {this.EDIT_ICON}
            </span>
            <span // TODO: add undo delete FOR REF ITEMS ONLY (after testing delete of new item)
              style={{ color: "red", cursor: "pointer", marginLeft: ".25em" }}
              onClick={() => {
                onDeleteItem();
                if (editFocused) {
                  onEditFocus(null);
                }
              }}
            >
              {this.DELETE_ICON}
            </span>
          </>
        )}
        {canEditItem && editFocused && (
          <>
            <span
              style={{ color: "green", cursor: "pointer", marginLeft: ".25em" }}
              onClick={() => {
                onSubmitEdit(editName);
                this.setState({ editName: null }); // TODO: figure out if this ordering (parent before child) of setState calls is problematic
              }}
            >
              {this.SAVE_ICON}
            </span>
            <span
              style={{ color: "white", cursor: "pointer", marginLeft: ".25em" }}
              onClick={() => {
                // TODO: get rid of parent's state that saves this
                onUndoEdit();
                this.setState({ editName: null });
              }}
            >
              {this.UNDO_ICON}
            </span>
          </>
        )}

        {canEditItem && status === ItemStatus.DELETED && (
          <span
            style={{ color: "white", cursor: "pointer", marginLeft: ".25em" }}
            onClick={onUndoDelete}
          >
            {this.UNDO_ICON}
          </span>
        )}
        {!editFocused && (
          <span
            key={idx}
            style={{
              marginLeft: ".5em",
              color: `${editFocused ? "pink" : StatusColors[status]}`
            }}
          >{`${name}: ${convertedBdayString(birthday)}`}</span>
        )}
        {canEditItem && editFocused && (
          <input
            type="text"
            value={editName}
            onChange={evt => {
              this.setState({ editName: evt.target.value });
            }}
            /*
            onChange={evt => {
              onEditItem(name, evt.target.value, birthday);
            }}
            */
          />
        )}
      </div>
    );
  }
}

BirthdayEditorItem.propTypes = {
  idx: PropTypes.number,
  name: PropTypes.string,
  birthday: PropTypes.string,
  status: PropTypes.number,
  canEditItem: PropTypes.bool,
  onEditFocus: PropTypes.func, // TODO: call this on idx when edit button clicked
  editFocused: PropTypes.bool,
  onEditItem: PropTypes.func,
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
  "01": "January",
  "02": "February",
  "03": "March",
  "04": "April",
  "05": "May",
  "06": "June",
  "07": "July",
  "08": "August",
  "09": "September",
  "10": "October",
  "11": "November",
  "12": "December"
});

/*
 * str 'YYYYMMDD' --> str <month> DD
 * E.g: '20200220' --> 'February 20'
 */
function convertedBdayString(str) {
  const month = str.slice(0, 2);
  const day = parseInt(str.slice(2)).toString(10); // remove leading zeros, e.g: '01' --> '1'
  return months[month] + " " + day;
}
