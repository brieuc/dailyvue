import { ref } from 'vue'

export function createOneDayItem(entriesArray, sDate, enteringItems, displayingItems) {

      let entries = entriesArray;
      let date = sDate;
      let isDisplayingItems = displayingItems;
      let isEnteringItems = enteringItems;

      return {
            entries,
            date,
            isDisplayingItems,
            isEnteringItems
      }
}