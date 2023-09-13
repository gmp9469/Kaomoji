// kaomoji.mjs
class Kaomoji{
    constructor(value, emotions){
      this.value = value;
      this.emotions = emotions.map(emotion => emotion.toLowerCase().trim());
    }
    isEmotion(emotion){
      return this.emotions.includes(emotion.toLowerCase().trim());
    }
  }
  
  export{
    Kaomoji,
  };