import mongoose, { Schema } from 'mongoose';

// Reference: http://info.sjsu.edu/web-dbgen/catalog/departments/CMPE-section-2.html

const programSchema = new mongoose.Schema({
  school: {
    type: String,
    required: true,
  },
  major: {
    type: String,
    required: true,
  },
  catalogYear: {
    type: Number,
    required: true,
  },
  generalEducation: {
    // General education requirements A - E
    type: Schema.Types.Mixed, // Note that this will require strong validation in the HTTP request to our backend server since it is of type Mixed.
    required: true,
  },
  majorRequirements: {
    // Requirements for the major
    type: Schema.Types.Mixed, // Note that this will require strong validation...
    required: true,
  },
  otherRequirements: {
    // University requirements such as 'American Institutions'
    type: Schema.Types.Mixed, // Note that this will require strong validation...
    required: true,
  },
});

/*
    Examples of how the data for generalEducation and majorRequirements would look like:
    generalEducation
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
    majorRequirements
    {
        "prepForMajor": [mongoose.Schema.Types.ObjectId],
        "coreCourses": [mongoose.Schema.Types.ObjectId],
        "requiredCourses": [mongoose.Schema.Types.ObjectId],
        "approvedElectives": [mongoose.Schema.Types.ObjectId]
    }
*/

export default programSchema;
