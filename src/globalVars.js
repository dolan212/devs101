class globals{

  constructor(name, type, defaultVal, req) {
    this._name = name;
    this._type = type;
    this._value = defaultVal;
    this._required = req;

  }

  set name(name) { this._name = name; }
  set value(val) { this._value = val; }
  set type(type) { return this._type = type; }
  set required(req) { this._required = req; }
  get name() { return this._name; }
  get type() { return this._type; }
  get value() { return this._value; }
  get required() { return this._required; }

}


class globalString extends globals{

  constructor(name, type, defaultVal, req) {
    //this._name = name;
    //this._type = type;
    if(typeof defaultVal == "string")
    {
      //this._value = defaultVal;
      super(name, type, defaultVal, req);
    }
    else
    {
      //this._value = "";
      defaultVal = "";
      console.log("Incorrect default value type");
      super(name, type, defaultVal, req);
    }
    //this._required = req;
  }

  set value(val) {
    if(typeof val == "string")
    {
      super.value(val);
    }
    else
    {
      val = "";
      console.log("Incorrect default value type");
      super.value(val);
    }
  }

}

class globalNumber extends globals{

  constructor(name, type, defaultVal, req) {
    //this._name = name;
    //this._type = type;
    if(typeof defaultVal == "number")
    {
      //this._value = defaultVal;
      super(name, type, defaultVal, req);
    }
    else
    {
      //this._value = "";
      defaultVal = 0;
      console.log("Incorrect default value type");
      console.log("Default value set to zero");
      super(name, type, defaultVal, req);
    }
    //this._required = req;
  }

  set value(val) {
    if(typeof val == "number")
    {
      super.value(val);
    }
    else
    {
      val = 0;
      console.log("Incorrect default value type");
      console.log("Default value set to zero");
      super.value(val);
    }
  }

}

class globalMultiSelect extends globals{

  constructor(name, type, defaultVal, req, vals) {
    //this._name = name;
    //this._type = type;
    if(vals.constructor === Array)
    {
      //this._value = defaultVal;
      var correct = false;
      for(var i = 0; i < vals.length; i++)
      {
        if(defaultVal == vals[i])
        {
          //super(name, type, defaultVal, req);
          correct = true;
          break;
        }
      }
      if(correct)
      {
        super(name, type, defaultVal, req);
      }
      else
      {
        console.log("Incorrect default value type");
        console.log("Default value set to vals array's first value");
        defaultVal = vals[0];
        super(name, type, defaultVal, req);
      }

      this._options = vals.slice();
    }
    else
    {
      //this._value = "";
      defaultVal = "";
      console.log("Incorrect default value and vals is not an array");
      console.log("Default value set to empty string and options set to empty array");
      super(name, type, defaultVal, req);
      this._options = [];
    }
    //this._required = req;
  }

  set value(val) {
    if(this._options.constructor === Array)
    {
      var correct = false;
      for(var i = 0; i < this._options.length; i++)
      {
        if(val == this._options[i])
        {
          //super(name, type, defaultVal, req);
          correct = true;
          break;
        }
      }
      if(correct)
      {
        super.value(val);
      }
      else
      {
        console.log("Incorrect default value type");
        console.log("Default value set to options array's first value");
        val = this._options[0];
        super.value(val);
      }
    }
    else
    {
      val = "";
      console.log("Incorrect default value and vals is not an array");
      console.log("Default value set to empty string and options set to empty array");
      super.value(val);
      this._options = [];
    }
  }

  get options() { return this._options; }
  set options(vals) {
    if(vals.constructor === Array)
    {
      this._options = vals.slice();
    }
    else
    {
      console.log("Incorrect vals is not an array");
      console.log("Options set to empty array");
      this._options = [];
    }
  }

  export function globals(name, type, defaultVal, req) {
    var gVar = globals(name, type, defaultVal, req);
    return gVar;
  }

}

