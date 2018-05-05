
export default interface TwitterUser {
    user_id: string,
    screen_name?: string,
    followers_count?: number,
    friends_count?: number,
    favorites_count?: number,
    statuses_count?: number,
    profile_picture_url?: string,
    geo_coord_long?: string,
    geo_coord_lat?: string,
    country?: string,
    city_name?: string
}