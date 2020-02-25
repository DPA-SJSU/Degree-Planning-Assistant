import mongoose, { Schema } from 'mongoose';

// Reference: http://info.sjsu.edu/web-dbgen/catalog/departments/CMPE-section-2.html

const programSchema = new mongoose.Schema({
  school: {
    type: String,
    required: true
  },
  major: {
    type: String,
    required: true,
  },
  catalog_year: {
    type: Number,
    required: true,
  },
  general_education: {
    // General education requirements A - E
    type: Schema.Types.Mixed, // Note that this will require strong validation in the HTTP request to our backend server since it is of type Mixed.
    required: true,
  },
  major_requirements: {
    // Requirements for the major
    type: Schema.Types.Mixed, // Note that this will require strong validation...
    required: true,
  },
  other_requirements: {
    // University requirements such as 'American Institutions'
    type: Schema.Types.Mixed, // Note that this will require strong validation...
    required: true,
  },
});

/*
    Examples of how the data for general_education and major_requirements would look like:
    general_education
    {
        "areaA": {
            "a1": [mongoose.Schema.Types.ObjectId],
            "a2": [mongoose.Schema.Types.ObjectId],
            "a3": [mongoose.Schema.Types.ObjectId]
        },
        "areaB": {
            "b1": [mongoose.Schema.Types.ObjectId],
            "b2": [mongoose.Schema.Types.ObjectId],
            "b3": [mongoose.Schema.Types.ObjectId]
        }
        ...
    }
    major_requirements
    {
        "prep_for_major": [mongoose.Schema.Types.ObjectId],
        "core_courses": [mongoose.Schema.Types.ObjectId],
        "required_courses": [mongoose.Schema.Types.ObjectId],
        "approved_electives": [mongoose.Schema.Types.ObjectId]
    }
*/

export default programSchema;
