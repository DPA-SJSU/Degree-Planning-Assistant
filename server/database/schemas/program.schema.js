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
            "a1": [...],
            "a2": [...],
            "a3": [...]
        },
        "areaB": {
            "b1": [...],
            "b2": [...],
            "b3": [...]
        }
        ...
    }
    major_requirements
    {
        "prepForMajor": [...],
        "coreCourses": [...],
        "requiredCourses": [...],
        "approvedElectives": [...]
    }
*/

export default programSchema;
