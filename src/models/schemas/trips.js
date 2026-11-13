import mongoose from "mongoose";

const tripSchema = new mongoose.Schema(
    {
        id: {
            type: String,
            required: true,
            unique: true,
            trim: true
        },
        name: {
            type: String,
            required: true,
            trim: true
        },
        description: {
            type: String,
            required: true,
            trim: true
        },
        region: {
            type: String,
            required: true,
            trim: true
        },
        startStation: {
            type: String,
            required: true,
            trim: true
        },
        endStation: {
            type: String,
            required: true,
            trim: true
        },
        duration: {
            type: String,
            required: true,
            trim: true
        },
        distance: {
            type: Number,
            required: true,
            min: 0
        },
        highlights: {
            type: [{ type: String, trim: true }], //optional Array of strings representing the highlights of the trip
            default: []
        },
        bestSeason: {
            type: String,
            required: true,
            trim: true
        },
        operatingMonths: {
            type: [{ type: Number, min: 1, max: 12 }], // Array of numbers representing the months the trip operates (1-12)
            required: true
        },
        imageUrl: {
            type: String, //optional field for the image URL of the trip
        },
        imageAlt: {
            type: String, //optional field for the alt text of the trip image
            trim: true,
        }
    },
    {
        collection: 'trips',
        versionKey: false,
        toJSON: {
            transform: (doc, ret) => {
                delete ret._id
                return ret
            }
        }
    }
)

const Trip = mongoose.model("Trip", tripSchema);

export default Trip;