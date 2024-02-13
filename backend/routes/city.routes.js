const express = require('express')
const pool = require('../db');
const router = express.Router();

router.post('/addCity', async (req, res) => {
    const { cityName, countryId, stateId } = req.body;

    try {

        const countryResult = await pool.query('SELECT * FROM country WHERE countryid = $1', [countryId]);
        const stateResult = await pool.query('SELECT * FROM state WHERE stateid = $1', [stateId]);

        if (countryResult.rows.length === 0 || stateResult.rows.length === 0) {
            return res.status(404).json({ error: 'Country or state not found.' });
        }
        const cityResult = await pool.query(
            'INSERT INTO city (countryid, stateid, cityname) VALUES ($1, $2, LOWER($3)) RETURNING *',
            [countryId, stateId, cityName]
        )

        if (cityResult) {
            res.status(200).json({ message: "City Added successfully", city: cityResult.rows[0] })
        } else {
            console.error('Error adding city');
        }
    } catch (error) {
        res.status(500).json({ error: 'Internal Server Error' });
    }
})

router.delete('/removeCity', async (req, res) => {
    const { cityId } = req.body;

    try {

        const result = await pool.query(
            'UPDATE city SET isdeleted = true WHERE cityid = $1 RETURNING *'
            , [cityId])

        if (result.rowCount > 0) {
            res.status(200).json({ message: `City with ${cityId} Deleted` })
        } else {
            res.status(404).json({ message: 'No state found' })
        }

    } catch (error) {
        console.error("Error deleting city", error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
})


router.put('/updateCity',async (req, res) => {
    let { cityId, cityName } = req.body;

    // const countryResult = await pool.query('SELECT * FROM country WHERE countryid = $1', [countryId]);
    // const stateResult = await pool.query('SELECT * FROM state WHERE stateid = $1', [stateId]);

    // if(countryResult.rows.length === 0 || stateResult.rows.length === 0){
    //     return res.status(404).json({ error: 'Country or state not found.' });
    // }

    const cityUpdate = await pool.query(
        'UPDATE city SET cityname = $1 WHERE cityid = $2 RETURNING *',
        [cityName, cityId])

    if (cityUpdate) {
        res.status(200).json({ message: "City Updated SuccessFully", city: cityUpdate.rows[0] })
    }
    else {
        res.status(500).json({ error: 'Server Error!' })
    }

})

router.get('/getCity',async (req, res) => {

    try {
        const result = await pool.query(

            // ' select city.* , country.countryname, state.statename ' +
            // 'from city '+
            // 'inner join state on city.stateid = state.stateid ' +
            // 'inner join country on city.countryid = country.countryid ' 

            `
            SELECT city.*, country.countryname, state.statename
            FROM city
            INNER JOIN country ON city.countryid = country.countryid
            INNER JOIN state ON city.stateid = state.stateid
            WHERE city.isdeleted = false
            ORDER BY city.cityname ASC`

        // 'select * from city'
        )

        res.status(200).json((result.rows))

    } catch (error) {
        console.error("Error Getting city", error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
})


module.exports = router