import React, { Component } from 'react';
import Section from '../../Components/Section';

export class Introduction extends Component {
  render() {
    return (
      <Section
        title='Intro'
        id='intro'
        style={{
          marginTop: '70px',
          display: 'flex',
          alignItems: 'center',
          flexDirection: 'column'
        }}
      >
        <div style={{ textAlign: 'center', color: 'white' }}>
          Never forget a friend's birthday again! In just a few clicks, download
          the .ics file of your friends' birthdays from Facebook and upload it
          here. Then, we'll send you daily reminders so you don't forget
          anyone's special day!
        </div>
        <div
          style={{
            color: '#787e9e'
          }}
        >
          <div>1. Register or sign in above.</div>
          <div>
            2. Download the file containing your friends' birthdays from
            Facebook (Click "Events", then click "Birthdays" under "Upcoming
            Events" on the bottom right corner of the page.)
          </div>
          <div>3. Upload the .ics file that you just downloaded.</div>
          <div>
            4. Set your preferred phone number, as well as how many days in
            advance you'd like to be notified.
          </div>
          <div>5. Receive an SMS reminder from us each morning!</div>
        </div>
      </Section>
    );
  }
}
