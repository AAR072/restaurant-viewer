import {Data} from "../../index"

export function storeSearch(
  data: Data, 
  searchID: string | undefined = undefined, 
  searchName: string | undefined = undefined,
  searchXPos: number | undefined = undefined,
  searchYPos: number | undefined = undefined,
  searchType: string | undefined = undefined,
  searchPrice: number [] | undefined = undefined, 
  searchReview: number [] | undefined = undefined
): Data {
  console.log("asdfasd")
  let t0 = performance.now();
  let startPointer = 0;
  let outputData: Data = {
    ID: [],
    storeName: [],
    type: [],
    cost: [],
    review: [],
    x: [],
    y: []
  };  

  // loop through our array, and find all values that match. We will put those in our output array

  for (let i = 0; i < data.ID.length - 1; i++){
    // check if all params are matching
    if (
      hasMatchingParams(data.ID[i], searchID) &&
        hasMatchingParams(data.storeName[i], searchName) &&
        hasMatchingParams(data.x[i], searchXPos) &&
        hasMatchingParams(data.y[i], searchYPos) &&
        hasMatchingParams(data.type[i], searchType) &&
        hasMatchingRange(data.cost[i], searchPrice) &&
        hasMatchingRange(data.review[i], searchReview) 
    ){
      // update our output data 
      outputData.ID[startPointer] = data.ID[i];
      outputData.storeName[startPointer] = data.storeName[i];
      outputData.type[startPointer] = data.type[i];
      outputData.cost[startPointer] = data.cost[i];
      outputData.review[startPointer] = data.review[i];
      outputData.x[startPointer] = data.x[i];
      outputData.y[startPointer] = data.y[i];
      startPointer++;
    }
  }

  let t1 = performance.now();
  console.log(t1 - t0);
  return outputData; 
}

function hasMatchingParams(currentParam: string | number | undefined, targetParam: string | number | undefined): boolean{
  if (targetParam === undefined){
    return true;
  }
  if (currentParam === targetParam){
    return true;
  }
  return false;
}

function hasMatchingRange(currentValue: number, targetRange: number [] | undefined): boolean{
  if (targetRange === undefined){
    return true;
  }
  if (currentValue >= targetRange[0] && currentValue <= targetRange[1] ){
    return true;
  }
  return false;
}

