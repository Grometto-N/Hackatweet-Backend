function checkBody(body, keys){
    let answer = true;
    for(let item of keys){
        if(body[item] === "" || !body[item]){
            answer = false;
        }
      }
      return answer;
}

module.exports = { checkBody}