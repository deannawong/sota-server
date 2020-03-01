// https://www.triposo.com/api/20190906/poi.json?tag_labels=food|museums|poitype-Museum_district|subtype-Natural_history_museums&location_id=Boston&count=20&fields=name,tag_labels,coordinates&annotate=persona:budget

//location_id "Istanbul","New_York_City","Bangkok","Paris","London","Dubai","Kuala_Lumpur","Singapore","Tokyo","Seoul"

//tag_labels=visas|art|character-Kid_friendly|food|poitype-Cafe|nightlife|exploringnature|hiking|showstheatresandmusic|poitype-Interesting_neighbourhood|poitype-Shopping_district|sightseeing|topattractions

//budget, mid_range,splurge

// fields=name,tag_labels,coordinates
//&annotate=distance:40.70505453503665,-74.00931658426346&annotate=persona:budget

const urlGenerator = ({ tags, location, budget, coordinates }) => {
    //takes object, returns string // default top attractions



    const tagsStr = `tag_labels=${tags.join("|")}`
    const locationStr = `location_id=${location}`
    const personaStr = `annotate=persona:${budget}`

    return `https://www.triposo.com/api/20190906/poi.json?`
}

module.export = { urlGenerator }