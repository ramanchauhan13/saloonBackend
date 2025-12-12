import express from 'express';
import State from '../models/State.js';
import City from '../models/City.js';

// Create a new State

export const createState = async (req, res) => {
    try {
        const { name, country, code } = req.body;
        if (!name || !country) {
            return res.status(400).json({ message: "State name and country are required." });
        }

        // already exists check with name check like Uttar Pradesh and uttar Pradesh and Uttarpradesh is same
        if(await State.findOne({name: new RegExp(`^${name}$`, 'i'), country: new RegExp(`^${country}$`, 'i')})){
            return  res.status(400).json({ message: "State with this name already exists in the country." });
        }

        const newState = new State({ name, country, code });
        await newState.save();
        res.status(201).json({ message: "State created successfully", state: newState });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Failed to create state", error: error.message });
    }
}

// Create a new City
export const createCity = async (req, res) => {
    try {
        const { name, state, country, pincode } = req.body;
        if (!name || !state || !country) {
            return res.status(400).json({ message: "City name, state, and country are required." });
        }

        // already exists check with name check like Mumbai and mumbai and Mumbay is same
        if(await City.findOne({name: new RegExp(`^${name}$`, 'i'), state, country: new RegExp(`^${country}$`, 'i')})){
            return  res.status(400).json({ message: "City with this name already exists in the state and country." });
        }

        const newCity = new City({ name, state, country, pincode });
        await newCity.save();
        res.status(201).json({ message: "City created successfully", city: newCity });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Failed to create city", error: error.message });
    }
}