from marshmallow import Schema, fields, validate, validates, ValidationError

class UserSchema(Schema):
    username = fields.Str(required=True, validate=validate.Length(min=3, max=80))
    email = fields.Email(required=True)
    password = fields.Str(required=True, validate=validate.Length(min=6), load_only=True)
    
    @validates('username')
    def validate_username(self, value):
        if not value.replace('_', '').replace('-', '').isalnum():
            raise ValidationError('Username can only contain letters, numbers, hyphens, and underscores.')

class UserLoginSchema(Schema):
    username = fields.Str(required=True)
    password = fields.Str(required=True, load_only=True)

class UserResponseSchema(Schema):
    id = fields.Str()
    username = fields.Str()
    email = fields.Email()
    created_at = fields.DateTime()
    is_active = fields.Bool()

class TasbehCountSchema(Schema):
    phrase = fields.Str(required=True, validate=validate.Length(min=1, max=200))
    count = fields.Int(missing=0, validate=validate.Range(min=0))

class UserPhraseSchema(Schema):
    phrase = fields.Str(required=True, validate=validate.Length(min=1, max=1000))

class UserLocationSchema(Schema):
    city = fields.Str(validate=validate.Length(max=100))
    country = fields.Str(validate=validate.Length(max=100))
    latitude = fields.Float(validate=validate.Range(min=-90, max=90))
    longitude = fields.Float(validate=validate.Range(min=-180, max=180))
    timezone = fields.Str(validate=validate.Length(max=50))

class UserPreferenceSchema(Schema):
    theme = fields.Str(validate=validate.OneOf(['light', 'dark']))
    daily_goal = fields.Int(validate=validate.Range(min=1, max=10000))
    sound_enabled = fields.Bool()
    prayer_notifications = fields.Dict()
    language_preference = fields.Str(validate=validate.OneOf(['ar', 'en']))

class QuranBookmarkSchema(Schema):
    surah_number = fields.Int(required=True, validate=validate.Range(min=1, max=114))
    ayah_number = fields.Int(required=True, validate=validate.Range(min=1))
    note = fields.Str(validate=validate.Length(max=1000))

class QuranProgressSchema(Schema):
    surah_number = fields.Int(required=True, validate=validate.Range(min=1, max=114))
    ayah_number = fields.Int(required=True, validate=validate.Range(min=1))
    reading_streak = fields.Int(validate=validate.Range(min=0))

class HadithFavoriteSchema(Schema):
    hadith_collection = fields.Str(required=True, validate=validate.Length(min=1, max=100))
    hadith_number = fields.Int(required=True, validate=validate.Range(min=1))
    hadith_text = fields.Str()

# Response schemas
tasbeh_response_schema = TasbehCountSchema()
tasbeh_list_response_schema = TasbehCountSchema(many=True)

user_phrase_response_schema = UserPhraseSchema()
user_phrase_list_response_schema = UserPhraseSchema(many=True)

user_response_schema = UserResponseSchema()
user_location_response_schema = UserLocationSchema()
user_preference_response_schema = UserPreferenceSchema()
