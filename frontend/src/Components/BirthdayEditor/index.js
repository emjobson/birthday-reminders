import React, { Component } from 'react';
import PropTypes from 'prop-types';
import styles from './styles.css';
import { BirthdayEditorItem } from '../BirthdayEditor/BirthdayEditorItem';

//@ts-check
export class BirthdayEditor extends Component {
  constructor(props) {
    super(props);
    this.state = {
      editMode: false,
      sortAlphabetically: true,
      filterString: '',
      currentEdit: null
    };
  }

  render() {
    const {
      editMode,
      sortAlphabetically,
      filterString,
      currentEdit
    } = this.state;
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
      if (friendID !== 'deleted' && !(friendID in referenceBirthdays)) {
        displayBirthdays.push({ ...editedBirthdays[friendID], key: friendID });
      }
    });

    if (filterString) {
      displayBirthdays = displayBirthdays.filter(obj =>
        obj.name.toLowerCase().includes(filterString.toLowerCase())
      );
    }

    const sortFn = sortAlphabetically
      ? (a, b) => (b.name.toLowerCase() < a.name.toLowerCase() ? 1 : -1)
      : (a, b) => (b.birthday < a.birthday ? 1 : -1);

    displayBirthdays.sort(sortFn);
    return (
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center'
        }}
      >
        <span className={styles.uploadedBirthdays}>
          {currentEdit ? (
            <div
              style={{
                marginTop: '40px',
                display: 'flex',
                height: '50%',
                flexDirection: 'column',
                justifyContent: 'space-evenly',
                alignItems: 'center'
              }}
            >
              <span>
                <span
                  style={{
                    color: `${currentEdit.name.length === 0 ? 'red' : 'green'}`,
                    position: 'relative',
                    left: '-4px',
                    top: '-4px'
                  }}
                >
                  *
                </span>
                <input
                  value={currentEdit.name}
                  style={{
                    backgroundColor: 'transparent',
                    color: '#5f92ce',
                    textAlign: 'center',
                    fontSize: '1.35em',
                    border: '1px solid #ced4da',
                    borderRadius: '.25em'
                  }}
                  type='text'
                  placeholder='Name'
                  onChange={evt => {
                    this.setState({
                      currentEdit: { ...currentEdit, name: evt.target.value }
                    });
                  }}
                />
              </span>
              <span>
                <select
                  style={{ margin: '5px' }}
                  value={
                    months[parseInt(currentEdit.birthday.substring(0, 2)) - 1]
                  }
                  onChange={evt => {
                    const monthStr = (months.indexOf(evt.target.value) + 1)
                      .toString()
                      .padStart(2, '0');

                    const birthday =
                      monthStr +
                      (parseInt(currentEdit.birthday.substring(2)) > // prevent invalid dates when choosing shorter months
                      monthLengths[parseInt(monthStr) - 1]
                        ? monthLengths[parseInt(monthStr) - 1]
                        : currentEdit.birthday.substring(2));

                    this.setState({
                      currentEdit: {
                        ...currentEdit,
                        birthday
                      }
                    });
                  }}
                >
                  {months.map((month, idx) => (
                    <option key={idx}>{month}</option>
                  ))}
                </select>
                <select
                  style={{ margin: '5px' }}
                  value={parseInt(currentEdit.birthday.substring(2))}
                  onChange={evt => {
                    const birthday =
                      currentEdit.birthday.substring(0, 2) +
                      evt.target.value.toString().padStart(2, '0');
                    this.setState({
                      currentEdit: {
                        ...currentEdit,
                        birthday
                      }
                    });
                  }}
                >
                  {[
                    ...Array(
                      monthLengths[currentEdit.birthday.substring(0, 2) - 1]
                    ).keys()
                  ].map((num, idx) => (
                    <option key={idx}>{num + 1}</option>
                  ))}
                </select>
              </span>
              <span>
                <button
                  onClick={() => {
                    this.setState({ currentEdit: null });
                  }}
                  style={{
                    marginRight: '5px',
                    borderRadius: '.25em'
                  }}
                >
                  Cancel
                </button>
                <button
                  disabled={currentEdit.name.length === 0}
                  onClick={() => {
                    const editedBirthdaysCopy = { ...editedBirthdays };
                    const { friendID, name, birthday } = currentEdit;
                    if (
                      // edited version now matches reference version
                      friendID in referenceBirthdays &&
                      name === referenceBirthdays[friendID].name &&
                      birthday === referenceBirthdays[friendID].birthday
                    ) {
                      delete editedBirthdaysCopy[friendID];
                    } else {
                      editedBirthdaysCopy[friendID] = {
                        name,
                        birthday
                      };
                    }
                    onEdit(editedBirthdaysCopy);
                    this.setState({ currentEdit: null });
                  }}
                  style={{ marginLeft: '5px', borderRadius: '.25em' }}
                >
                  OK
                </button>
              </span>
            </div>
          ) : (
            <>
              <div
                style={{
                  height: '2.25em',
                  borderBottom: '1px solid #787e9e',
                  position: 'absolute',
                  width: '348px',
                  backgroundColor: '#1a1e31',
                  borderRadius: '.5em .5em 0 0',
                  display: 'flex',
                  opacity: '.95',
                  alignItems: 'center'
                }}
              >
                <span
                  style={{
                    display: 'inline-block',
                    color: 'rgb(120, 126, 158)',
                    cursor: 'pointer',
                    width: '75px',
                    textAlign: 'center',
                    lineHeight: '2',
                    borderRight: '1px solid rgb(120, 126, 158)',
                    backgroundColor: '#1a1e31',
                    borderRadius: 'inherit'
                  }}
                  onClick={() => {
                    if (editMode) {
                      this.setState({
                        editMode: false
                      });
                    } else {
                      this.setState({ editMode: true });
                    }
                  }}
                >
                  {editMode ? 'Done' : 'Edit'}
                </span>
                <input
                  type='text'
                  style={{
                    margin: '8px',
                    backgroundColor: 'transparent',
                    color: 'white',
                    border: 'transparent'
                  }}
                  placeholder='Filter by name'
                  value={filterString}
                  onChange={evt => {
                    this.setState({ filterString: evt.target.value });
                  }}
                />
                <span
                  style={{
                    fontSize: '2em',
                    marginLeft: 'auto',
                    marginRight: '.3em',
                    cursor: 'pointer',
                    marginBottom: '6px'
                  }}
                  onClick={() => {
                    const friendID =
                      Math.max(
                        ...Object.keys(editedBirthdays).filter(
                          key => key !== 'deleted'
                        ),
                        maxReferenceFriendID,
                        -1
                      ) + 1;

                    this.setState({
                      currentEdit: { friendID, name: '', birthday: '0101' }
                    });
                  }}
                >
                  &#8853;
                </span>
              </div>
              <div style={{ height: '2.25em' }} />
              {displayBirthdays.map(obj => (
                <BirthdayEditorItem
                  key={obj.key}
                  displayName={obj.name}
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
                  }
                  editMode={editMode}
                  onEditFocus={() => {
                    this.setState({
                      currentEdit: {
                        friendID: obj.key,
                        name: obj.name,
                        birthday: obj.birthday
                      }
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
                  onUndoEdit={() => {
                    const editedBirthdaysCopy = { ...editedBirthdays };
                    delete editedBirthdaysCopy[obj.key];
                    onEdit(editedBirthdaysCopy);
                  }}
                />
              ))}
            </>
          )}
        </span>
        <span style={{ fontSize: '.85em' }}>
          <span style={{ color: 'green' }}>to add, </span>
          <span style={{ color: 'yellow' }}>to modify, </span>
          <span style={{ color: 'red' }}>to delete, </span>
          <span style={{ color: 'white' }}>no change</span>
        </span>
      </div>
    );
  }
}

const months = [
  'January',
  'February',
  'March',
  'April',
  'May',
  'June',
  'July',
  'August',
  'September',
  'October',
  'November',
  'December'
];

const monthLengths = [31, 29, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];

BirthdayEditor.propTypes = {
  referenceBirthdays: PropTypes.object,
  editedBirthdays: PropTypes.object,
  onEdit: PropTypes.func,
  maxReferenceFriendID: PropTypes.number
};

BirthdayEditor.defaultProps = {
  referenceBirthdays: {}
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
  [ItemStatus.NEW]: 'green', // can edit or delete (status remains "new")
  [ItemStatus.EDITED]: 'yellow', // can edit (status remains), delete (status to edited), or undo (status to unchanged)
  [ItemStatus.DELETED]: 'red', // can undo (status to unchanged)
  [ItemStatus.UNCHANGED]: 'white' // can edit or delete
});
