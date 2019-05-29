import React, { Component } from "react";
import PropTypes from "prop-types";
import styles from "./styles.css";
import { BirthdayEditorItem } from "../BirthdayEditor/BirthdayEditorItem";

export class BirthdayEditor extends Component {
  constructor(props) {
    super(props);
    this.state = {
      editMode: true,
      editFocusFriendID: null,
      sortAlphabetically: true
    };
  }

  /*
   * TODOs:
   *    1. don't sort until AFTER you finish editing an item
   *      option a.
   *         sort by initial order (will maintain list of keys, ordered by INITIAL display name)
   *          (for reference: friendId and name ... for new: old name as id, new name as display)
   *      option b.
   *        add an "originalName" property to everything and sort by that --> for most items, that's
   *        just its name --> for the single item that we're editing, that's the original name
   *          --> this is the cleanest solution I've thought of
   *              when we editFocus on something, we need to set an object that contains its index and originalName
   *                 (saving index is only a necessity since I never made the new entries uniquely identifiable --> will keep this in mind for future projects)
   *          --> any time the editFocus item loses focus (choose different edit item, delete, or click outside on page (to implement later)),
   *              need to reset this to null
   *          --> THIS WON'T WORK UNLESS NEW NAMES ARE UNIQUELY IDENTIFIABLE (someone COULD choose
   *            to upload a friend whose name collides with a friendID) --> will need to restructure editedBirthdays, give new items friendIDs that don't collide with existing friendIDs
   */

  render() {
    const { editMode, editFocusFriendID, sortAlphabetically } = this.state;
    const {
      referenceBirthdays = {},
      editedBirthdays,
      onEdit,
      maxReferenceFriendID
    } = this.props;

    let displayBirthdays = Object.keys(referenceBirthdays).map(friendID => {
      const obj = { key: friendID };
      if (friendID in editedBirthdays) {
        obj.name = editedBirthdays[friendID].name;
        obj.birthday = editedBirthdays[friendID].birthday;
      } else {
        obj.name = referenceBirthdays[friendID].name;
        obj.birthday = referenceBirthdays[friendID].birthday;
      }
      return obj;
    });

    Object.keys(editedBirthdays).forEach(friendID => {
      if (friendID !== "deleted" && !(friendID in referenceBirthdays)) {
        displayBirthdays.push({ ...editedBirthdays[friendID], key: friendID });
      }
    });

    /*
    displayBirthdays = displayBirthdays.concat(
      // previous mistake here: assumed concat mutated array, rather than return new
      Object.keys(editedBirthdays.new || {}).map(name => ({
        key: "new",
        name,
        birthday: editedBirthdays.new[name]
      }))
    );
    */

    //  const displayFriendIds = new Set(displayBirthdays.map(obj => obj.key));
    const sortFn = sortAlphabetically
      ? (a, b) => (b.name.toLowerCase() < a.name.toLowerCase() ? 1 : -1)
      : (a, b) => (b.birthday < a.birthday ? 1 : -1);

    displayBirthdays.sort(sortFn);

    return (
      <div>
        <span className={styles.uploadedBirthdays}>
          {displayBirthdays.map((obj, idx) => (
            <BirthdayEditorItem
              idx={idx}
              name={obj.name}
              birthday={obj.birthday}
              status={
                /*
                 * key in deleted? -> DELETED
                 * key not in edited? -> UNCHANGED
                 * int(key) > maxReferenceFriendID? --> NEW
                 * else --> EDITED
                 */
                editedBirthdays.deleted.has(obj.key)
                  ? ItemStatus.DELETED
                  : !(obj.key in editedBirthdays)
                  ? ItemStatus.UNCHANGED
                  : parseInt(obj.key, 10) > maxReferenceFriendID
                  ? ItemStatus.NEW
                  : ItemStatus.EDITED

                /*
                obj.key !== "new" && obj.key in editedBirthdays
                  ? ItemStatus.EDITED
                  : editedBirthdays.deleted.has(obj.key)
                  ? ItemStatus.DELETED
                  : obj.key in referenceBirthdays
                  ? ItemStatus.UNCHANGED
                  : ItemStatus.NEW

                */
              }
              canEditItem={
                editMode &&
                (editFocusFriendID === null || editFocusFriendID === obj.key)
              }
              onEditFocus={() => {
                this.setState({ editFocusFriendID: obj.key });
              }}
              editFocused={editFocusFriendID === obj.key}
              onEditItem={(name, birthday) => {
                onEdit({
                  ...editedBirthdays,
                  [obj.key]: { name, birthday }
                });
              }}
              onDeleteItem={() => {
                const editedCopy = { ...editedBirthdays };
                delete editedCopy[obj.key]; // not necessary to check for property existence
                if (obj.key in referenceBirthdays) {
                  editedCopy.deleted.add(obj.key);
                }
                onEdit(editedCopy);
              }}
              onUndoDelete={() => {
                const editedCopy = { ...editedBirthdays };
                editedCopy.deleted.delete(obj.key);
                onEdit(editedCopy);
              }}
              onSubmitEdit={editName => {
                console.log(">>>saving editedBirthdays as", {
                  ...editedBirthdays,
                  [obj.key]: { name: editName, birthday: obj.birthday }
                });
                onEdit({
                  ...editedBirthdays,
                  [obj.key]: { name: editName, birthday: obj.birthday }
                });
                this.setState({ editFocusFriendID: null });
              }}
              onUndoEdit={() => {
                this.setState({ editFocusFriendID: null });
              }}
            />
          ))}
        </span>
        <span
          style={{
            //     border: "1px solid black",
            display: "inline-block",
            width: "200px"
          }}
        >
          <div style={{ marginLeft: ".25em" }}>Key:</div>
          <ul style={{ marginBottom: ".25em" }}>
            <li style={{ color: "green" }}>birthday to add</li>
            <li style={{ color: "red" }}>birthday to delete</li>
            <li style={{ color: "#5f92ce" }}>no change</li>
          </ul>
        </span>
      </div>
    );
  }
}

BirthdayEditor.propTypes = {
  referenceBirthdays: PropTypes.object,
  editedBirthdays: PropTypes.object,
  onEdit: PropTypes.func,
  maxReferenceFriendID: PropTypes.number
};

BirthdayEditor.defaultProps = {
  referenceBirthdays: {}
  //  editedBirthdays: {}
};

/*
 * Notes:
 *  Items belong to ONE AND ONLY ONE of the following four states.
 *
 *  "edited", "deleted", and "unchanged"  refer to possible states of items
 *    that exist in our database and will be either edited, deleted, or left unchanged
 *
 *  "new" refers to an item to be added to the database (an edited "new" item is still "new")
 */
export const ItemStatus = Object.freeze({
  NEW: 0, // item in editedBirthdays.new
  EDITED: 1, // item has a friendID (NOT NEW), and that friendID is in editedBirthdays
  DELETED: 2, // item has a friendID (NOT NEW), and that friendID is in editedBirthdays.deleted
  UNCHANGED: 3 // item has a friendID (NOT NEW), and exists in referenceBirthdays (but nowhere else)
});

export const StatusColors = Object.freeze({
  [ItemStatus.NEW]: "green", // can edit or delete (status remains "new")
  [ItemStatus.EDITED]: "yellow", // can edit (status remains), delete (status to edited), or undo (status to unchanged)
  [ItemStatus.DELETED]: "red", // can undo (status to unchanged)
  [ItemStatus.UNCHANGED]: "white" // can edit or delete
});
