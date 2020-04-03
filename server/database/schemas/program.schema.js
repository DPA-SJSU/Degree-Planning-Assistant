import mongoose, { Schema } from 'mongoose';

// Reference: http://info.sjsu.edu/web-dbgen/catalog/departments/CMPE-section-2.html

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

const programSchema = new mongoose.Schema({
  school: { type: String, required: true },
  major: { type: String, required: true },
  catalogYear: { type: String, required: true },
  requirements: [{ type: Schema.Types.ObjectId, ref: 'Requirement' }],
  //   generalEducation: { type: Schema.Types.Mixed },
  //   majorRequirements: { type: Schema.Types.Mixed },
  //   otherRequirements: { type: Schema.Types.Mixed },
});

export default programSchema;
