const EXISTS = "Selected :attribute is invalid.";
const locale = {
  accepted: ":attribute must be accepted.",
  active_url: ":attribute is not a valid URL.",
  after: ":attribute must be a date after :date.",
  alpha: ":attribute may only contain letters.",
  alpha_dash: ":attribute may only contain letters, numbers, and dashes.",
  alpha_num: ":attribute may only contain letters and numbers.",
  array: ":attribute must be an array.",
  before: ":attribute must be a date before :date.",
  between: {
    numeric: ":attribute must be between :min and :max.",
    file: ":attribute must be between :min and :max kilobytes.",
    string: ":attribute must be between :min and :max characters.",
    array: ":attribute must have between :min and :max items."
  },
  boolean: ":attribute must be true or false.",
  confirmed: ":attribute confirmation does not match.",
  date: ":attribute is not a valid date.",
  date_format: ":attribute does not match the format :format.",
  different: ":attribute and :other must be different.",
  digits: ":attribute must be :digits digits.",
  digits_between: ":attribute must be between :min and :max digits.",
  dimensions: ":attribute has invalid image dimensions.",
  distinct: ":attribute has a duplicate value.",
  email: ":attribute must be a valid email address.",
  exists: EXISTS,
  file: ":attribute must be a file.",
  filled: ":attribute is required.",
  image: ":attribute must be an image.",
  in: EXISTS,
  in_array: ":attribute does not exist in :other.",
  integer: ":attribute must be an integer.",
  ipaddress: ":attribute must be a valid IP address.",
  iporurl: ":attribute must be a valid IP / FQDN.",
  json: ":attribute must be a valid JSON string.",
  max: {
    numeric: ":attribute may not be greater than :max.",
    file: ":attribute may not be greater than :max kilobytes.",
    string: ":attribute may not be greater than :max characters.",
    array: ":attribute may not have more than :max items."
  },
  mimes: ":attribute must be a file of type: :values.",
  mimetypes: ":attribute must be a file of type: :values.",
  min: {
    numeric: ":attribute must be at least :min.",
    file: ":attribute must be at least :min kilobytes.",
    string: ":attribute must be at least :min characters.",
    array: ":attribute must have at least :min items."
  },
  not_in: EXISTS,
  numeric: ":attribute must be a number.",
  present: ":attribute must be present.",
  regex: ":attribute format is invalid.",
  required: ":attribute is required.",
  required_if: ":attribute is required when :other is :value.",
  required_unless: ":attribute is required unless :other is in :values.",
  required_with: ":attribute is required when :values is present.",
  required_with_all: ":attribute is required when :values is present.",
  required_without: ":attribute is required when :values is not present.",
  required_without_all:
    ":attribute is required when none of :values are present.",
  same: ":attribute and :other must match.",
  greater: ":attribute should be greater than :other.",
  less: ":attribute should be lesser than :other.",
  not_equal: ":attribute should not be same as :other.",
  size: {
    numeric: ":attribute must be :size.",
    file: ":attribute must be :size kilobytes.",
    string: ":attribute must be :size characters.",
    array: ":attribute must contain :size items."
  },
  string: ":attribute must be a string.",
  timezone: ":attribute must be a valid zone.",
  unique: ":attribute has already been taken.",
  uploaded: ":attribute failed to upload.",
  url: ":attribute format is invalid.",
  resolution: ":attribute resolution should be atleast :resolution",
  custom: {
    "attribute-name": {
      "rule-name": "custom-message"
    }
  },
  attributes: [],
  password:
    ":attribute must have atleast 1 uppercase, lowercase, special character and number."
};

export default locale;
