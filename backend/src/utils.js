module.exports = {
  quotesOrNULL: function(str) {
    return str ? "'" + str + "'" : "NULL";
  },
  // takes in Date object, returns string date in format MMDD
  dateString: function(date) {
    return (
      (date.getMonth() + 1).toString().padStart(2, "0") +
      date
        .getDate()
        .toString()
        .padStart(2, "0")
    );
  },

  constructReminderText: function(result) {
    if (result.length === 0) {
      return "None of your friends have birthdays today!";
    }
    return (
      "Don't forget to wish these friends a happy birthday!\n" +
      result.map(entry => entry.name).join("\n")
    );
  }
};
