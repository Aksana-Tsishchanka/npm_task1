let id = 0;

export default class User {
  constructor(name) {
    this.name = name;
    this.id = id++;
  }
}

