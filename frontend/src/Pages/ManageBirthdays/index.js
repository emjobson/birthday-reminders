import React, { Component } from 'react';
import { parseICal } from '../../utils';
import Section from '../../Components/Section';
import auth0Client from '../../Auth';
import { BirthdayEditor } from '../../Components/BirthdayEditor';
import { Introduction } from '../../Components/Introduction';
import {
  getFriends,
  updatePreferences,
  sendNotification,
  getUser,
  setFriends
} from '../../API';
import { GradientButton } from '../../Components/GradientButton';
import * as _ from 'lodash';

//@ts-check
export default class ManageBirthdays extends Component {
  constructor(props) {
    super(props);
    this.state = {
      birthdayFile: null,
      referenceBirthdays: {},
      editedBirthdays: { deleted: new Set() },
      stagedPreferences: { phoneNumber: '', notificationTime: '0' },
      uploadedPreferences: { phoneNumber: '', notificationTime: '0' },
      userID: null
    };
  }

  componentDidMount() {
    this.syncUser();
  }

  syncUser = async () => {
    console.log('auth0Client.getProfile().name', auth0Client.getProfile().name);
    const userData = await getUser(auth0Client.getProfile().name);
    const { userID, preferences } = userData;
    const { referenceBirthdays, maxReferenceFriendID } = await getFriends(
      userID
    );
    this.setState({
      uploadedPreferences: preferences || {
        phoneNumber: '',
        notificationTime: '0'
      },
      referenceBirthdays: referenceBirthdays,
      editedBirthdays: { deleted: new Set() }, // NEW
      stagedPreferences: preferences || {
        // will later delete "preferences.notificationTime"
        phoneNumber: '',
        notificationTime: '0'
      },
      userID: userID,
      maxReferenceFriendID
    });
  };

  readFileAsText = async file => {
    const reader = new FileReader();
    return new Promise((resolve, reject) => {
      reader.onerror = () => {
        reader.abort();
        reject(new DOMException('Problem parsing file.'));
      };
      reader.onload = () => {
        resolve(reader.result);
      };
      reader.readAsText(file);
    });
  };

  handleBirthdaysSubmit = async () => {
    const { userID, editedBirthdays } = this.state;
    if (
      Object.keys(
        editedBirthdays.length > 1 || editedBirthdays.deleted.size > 0
      )
    ) {
      await setFriends(userID, editedBirthdays);
    }
    this.syncUser();
  };

  handlePreferencesSubmit = async () => {
    const { userID, stagedPreferences } = this.state;
    console.log(
      '>>>preferences obj at handlePreferencesSubmit',
      stagedPreferences
    );
    await updatePreferences(userID, stagedPreferences);
    this.syncUser();
  };

  // adding margin on Section caused parent/background div to move down -- see below for how to escape
  // https://css-tricks.com/forums/topic/why-is-margin-top-causing-the-background-of-a-parent-div-to-move-down/
  render() {
    const {
      userID,
      referenceBirthdays,
      editedBirthdays,
      maxReferenceFriendID,
      stagedPreferences,
      uploadedPreferences
    } = this.state;

    return (
      <div style={{ color: '#787e9e' }}>
        <Introduction />
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-evenly',
            marginBottom: '20px'
          }}
        >
          <Section
            title='Birthdays'
            id='birthdays'
            style={{
              marginTop: '40px',
              display: 'flex',
              alignItems: 'center',
              flexDirection: 'column'
            }}
          >
            <div>Add, edit, and delete entries below.</div>
            <div>
              Add entries manually, or upload a file to stage entries in bulk.
            </div>
            <BirthdayEditor
              referenceBirthdays={referenceBirthdays}
              editedBirthdays={editedBirthdays}
              onEdit={editedBirthdays => {
                this.setState({ editedBirthdays });
              }}
              maxReferenceFriendID={maxReferenceFriendID}
            />
            <div style={{ marginTop: '10px' }}>
              <div className='custom-file'>
                <input
                  style={{ cursor: 'pointer' }}
                  type='file'
                  className='custom-file-input'
                  id='inputGroupFile02'
                  accept='.ics'
                  onChange={async evt => {
                    this.setState({ birthdayFile: evt.target.files[0] });
                    try {
                      const fileTxt = await this.readFileAsText(
                        evt.target.files[0]
                      );
                      console.log(fileTxt);
                      const bdays = parseICal(fileTxt);
                      const usedNames = new Set(
                        Object.keys(referenceBirthdays).map(
                          friendID => referenceBirthdays[friendID].name
                        )
                      );
                      const newBirthdays = {};
                      let friendID = maxReferenceFriendID + 1;
                      Object.keys(bdays).forEach(name => {
                        if (!usedNames.has(name)) {
                          newBirthdays[friendID.toString()] = {
                            name,
                            birthday: bdays[name].slice(4, 8)
                          };
                          friendID++;
                        }
                      });

                      this.setState({
                        editedBirthdays: {
                          ...editedBirthdays,
                          ...newBirthdays
                        }
                      });
                    } catch (e) {
                      console.warn(e.message);
                    }
                  }}
                />
                <label
                  className='custom-file-label'
                  htmlFor='inputGroupFile02'
                  style={{
                    borderRadius: '.25rem',
                    color: 'grey',
                    backgroundColor: 'transparent'
                  }}
                >
                  {(this.state.birthdayFile && this.state.birthdayFile.name) ||
                    'Choose File'}
                </label>
              </div>
              <div
                style={{
                  display: 'flex'
                }}
              >
                <GradientButton
                  text='SUBMIT'
                  onClick={() => this.handleBirthdaysSubmit()}
                  style={{ margin: '.5em .25em' }}
                />
                <GradientButton
                  text='CLEAR CHANGES'
                  onClick={() => {
                    this.setState({
                      birthdayFile: null,
                      editedBirthdays: { deleted: new Set() }
                    });
                  }}
                  style={{ margin: '.5em .25em' }}
                />
              </div>
            </div>
          </Section>
          <Section
            title='Preferences'
            id='preferences'
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              marginTop: '25px',
              marginBottom: '30px'
            }}
          >
            <div style={{ marginBottom: '10px' }}>
              {uploadedPreferences.phoneNumber &&
                uploadedPreferences.notificationTime && (
                  <>
                    <span>We'll send your reminders at 6am PST to </span>
                    <span style={{ color: '#5f92ce' }}>
                      {addTelephoneFormatting(uploadedPreferences.phoneNumber)}
                    </span>
                    <span style={{ color: 'white' }}>
                      {` ${
                        uploadedPreferences.notificationTime === '0'
                          ? 'zero'
                          : uploadedPreferences.notificationTime === '1'
                          ? 'one'
                          : 'seven'
                      } day${
                        uploadedPreferences.notificationTime !== '1' ? 's' : ''
                      }`}
                    </span>
                    <span> in advance.</span>
                  </>
                )}
              {(!uploadedPreferences.phoneNumber ||
                !uploadedPreferences.notificationTime) && (
                <span>
                  Please save a ten-digit phone number and notification time
                  preference.
                </span>
              )}
            </div>
            <span>
              <span
                style={{
                  color: `${
                    stagedPreferences.phoneNumber.length === 10
                      ? 'green'
                      : 'red'
                  }`,
                  position: 'relative',
                  top: '-4px',
                  right: '-3px'
                }}
              >
                *
              </span>
              <input
                style={{
                  width: '200px',
                  margin: '.5em',
                  display: 'inline-block',
                  color: '#5f92ce',
                  backgroundColor: 'transparent'
                }}
                type='tel'
                pattern='[0-9]{3}-[0-9]{3}-[0-9]{4}'
                required
                onChange={evt => {
                  const curValue = addTelephoneFormatting(
                    this.state.stagedPreferences.phoneNumber
                  );
                  let targetValue = evt.target.value.slice();
                  // delete
                  if (targetValue.length === curValue.length - 1) {
                    // if only dash deleted, remove preceding digit instead
                    if (
                      targetValue.substring(0, 8) ===
                        curValue.substring(0, 8) &&
                      targetValue.substring(8, 12) === curValue.substring(9, 13)
                    ) {
                      targetValue =
                        targetValue.substring(0, 7) + targetValue.substring(8);
                    } else if (
                      targetValue.substring(0, 4) ===
                        curValue.substring(0, 4) &&
                      targetValue.substring(4, 12) === curValue.substring(5, 13)
                    ) {
                      //')' deleted, so remove preceding digit instead
                      targetValue =
                        targetValue.substring(0, 3) + targetValue.substring(4);
                    }
                  }
                  this.setState({
                    stagedPreferences: {
                      ...stagedPreferences,
                      phoneNumber: stripTelephoneFormatting(targetValue)
                    }
                  });
                }}
                value={addTelephoneFormatting(
                  this.state.stagedPreferences.phoneNumber
                )}
                className='form-control'
                placeholder='(012)345-6789'
                aria-label='phone_number'
              />
            </span>

            <div />
            <span>
              <span>I want my notifications:</span>
              <select
                value={NOTIFICATION_OPTIONS[stagedPreferences.notificationTime]}
                onChange={evt => {
                  this.setState({
                    stagedPreferences: {
                      ...stagedPreferences,
                      notificationTime: NOTIFICATION_OPTIONS[evt.target.value]
                    }
                  });
                }}
                style={{ margin: '0 .75em' }}
              >
                <option>{NOTIFICATION_OPTIONS['0']}</option>
                <option>{NOTIFICATION_OPTIONS['1']}</option>
                <option>{NOTIFICATION_OPTIONS['7']}</option>
              </select>
            </span>
            <GradientButton
              text='SAVE PREFERENCES'
              onClick={() => {
                if (stagedPreferences.phoneNumber.length === 10) {
                  this.handlePreferencesSubmit();
                }
              }}
              style={{ margin: '.5em .25em' }}
            />

            <div style={{ marginTop: '25px' }}>
              Try it! Click below to send yourself today's reminder.
            </div>
            <button
              style={{ marginTop: '10px', borderRadius: '.25em' }}
              onClick={() => {
                sendNotification(userID);
                document.activeElement.blur();
              }}
            >
              Send
            </button>
          </Section>
        </div>
      </div>
    );
  }
}

// stateless functions

// takes in a string, and returns the first 10 digits
function stripTelephoneFormatting(phoneNumber) {
  return phoneNumber.replace(/[^0-9]/g, '').substring(0, 10);
}

/*
 * Takes in a string consisting solely of digits, up to length 10.
 * Returns string with American phone number formatting:
 *  3 or more digits --> will have parentheses around first 3 digits
 *  6 or more digits --> will have dash after 6th digit
 */
function addTelephoneFormatting(phoneNumber) {
  if (phoneNumber.length < 3) {
    return phoneNumber;
  } else if (phoneNumber.length < 6) {
    return '(' + phoneNumber.substring(0, 3) + ')' + phoneNumber.substring(3);
  } else {
    return (
      '(' +
      phoneNumber.substring(0, 3) +
      ')' +
      phoneNumber.substring(3, 6) +
      '-' +
      phoneNumber.substring(6)
    );
  }
}

const NOTIFICATION_OPTIONS = {
  '0': 'day of',
  'day of': '0',
  '1': 'one day in advance',
  'one day in advance': '1',
  '7': 'one week in advance',
  'one week in advance': '7'
};
