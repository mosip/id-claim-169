%%%
title = "Id Claim 169 in QR-Code - CBOR"
abbrev = "QR-Code Claim 169"
category = "standard"
docname = "draft-sasikumar-id-claim-169"
submissiontype = "IETF"  # also: "independent", "editorial", "IAB", or "IRTF"
workgroup = "COSE"
keyword = ["CBOR", "169", "QR Code", "Identity"]

[seriesInfo]
name = "Internet-Draft"
value = "draft-sasikumar-id-claim-169-latest"
stream = "IETF"
status = "standard"

[[author]]
fullname = "Resham Chugani"
organization = "MOSIP"
  [author.address]
  email = "resham@mosip.io"

[[author]]
fullname = "Mahammed Taheer"
organization = "CyberPWN"
  [author.address]
  email = "mohd.taheer@gmail.com"

[[author]]
fullname = "Rounak Nayak"
organization = "Ooru Digital"
  [author.address]
  email = "rounak@ooru.io"

[[author]]
fullname = "Sasikumar G"
organization = "MOSIP"
  [author.address]
  email = "sasi@mosip.io"

[[author]]
fullname = "Sreenadh S"
organization = "MOSIP"
  [author.address]
   email = "sreeavtar@gmail.com"
%%%

.# Abstract

This document specifies a generic data structure and encoding mechanism for storing the Identity Data of a registered person using any ID platform. It also provides a transport encoding mechanism in a machine-readable optical format (QR).

{mainmatter}

# Introduction

Once a person is registered in an identity system, their data serves as the foundation for identification, granting them access to social benefits and government services. The level of assurance in this identification process varies depending on the authentication methods employed. Low assurance is achieved through basic identifiers like ID numbers, demographic data, passwords, or PINs. Conversely, higher assurance levels are attained through one-time passwords (OTP) and biometrics.

Among these methods, biometric-based authentication, such as facial authentication, offers the highest level of assurance as it assures the presence of the individual. While this is effective for online systems & personal phones where verification is conducted on a server or a personal device; offline authentication presents challenges in maintaining a similarly high level of assurance. The offline authentication mechanism should work for people with no phone.

For instance, in a cross-border scenario remote areas often face significant internet connectivity issues. Even when internet access is available, server reliability may be inconsistent. In such circumstances, scanning a QR code containing the person's facial photograph and identity information, alongside assurance that the data is country-signed, provides an additional layer of security and affirmation for the countries involved.

**Please note:** The trust layers required to sync the country's key are beyond the scope of this document. We assume the app scanning the QR code already has the country's key to verify.

To tackle the challenge above, we propose a standard CBOR-based QR Code that involves embedding a low-resolution image of the person with a minimal demographic dataset within the QR code. This QR code would be digitally signed by the ID authorities (Issuer) and then printed on a physical card. Subsequently, the signed data within the QR code can be utilized for facial authentication. However, it's essential to recognize that QR codes have limitations regarding size. We suggest leveraging CBOR Web Token (CWT) with ED25519/ECC keys to generate a smaller signature and more condensed data.

Claim 169 represents a JSON Object that includes the below table as ID attributes. You can find an illustration of the ID structure contained within Claim 169, where:

# Semantics

## CBOR Map Structure Overview

All the fields here are OPTIONAL.

| Attribute | Type           | Attribute Name       | Description                                                                                                                                                                                                                             |
|-----------|----------------|----------------------|-----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| `1`       | `tstr`         | ID                   | Unique ID to indicate the PII data                                                                                                                                                                                                      |
| `2`       | `tstr`         | Version              | Version of the ID data                                                                                                                                                                                                                  |
| `3`       | `tstr`         | Language             | Language used in other attributes                                                                                                                                                                                                       |
| `4`       | `tstr`         | Full Name            | Full name of the  person                                                                                                                                                                                                                |
| `5`       | `tstr`         | First Name           | First name of the person                                                                                                                                                                                                                |
| `6`       | `tstr`         | Middle Name          | Middle name of the person                                                                                                                                                                                                               |
| `7`       | `tstr`         | Last Name            | Last name of the person                                                                                                                                                                                                                 |
| `8`       | `tstr`         | Date of Birth        | Date of birth in YYYYMMDD format                                                                                                                                                                                                        |
| `9`       | `int`          | Gender               | Gender with the following values `1` - Male, `2` - Female, `3` - Others                                                                                                                                                                 |
| `10`      | `tstr`         | Address              | Address of the person separator character `\n`                                                                                                                                                                                          |
| `11`      | `tstr`         | Email ID             | Email id of the person                                                                                                                                                                                                                  |
| `12`      | `tstr`         | Phone Number         | Contact number of the person                                                                                                                                                                                                            |
| `13`      | `tstr`         | Nationality          | Nationality of the person                                                                                                                                                                                                               |
| `14`      | `int`          | Marital Status       | Marital status - Can contain the following values `1` - Unmarried, `2` - Married, `3` - Divorced                                                                                                                                        |
| `15`      | `tstr`         | Guardian             | Name/id of the entity playing the role of a guardian, such as a mother, father, spouse, sister, legal guardian etc.                                                                                                                     |
| `16`      | `tstr`         | Binary Image         | Binary image of the person's photograph                                                                                                                                                                                                 |
| `17`      | `int`          | Binary Image Format  | Binary image format. Can contain the following values `1` - JPEG, `2` - JPEG2, `3` - AVIF, `4` - WEBP                                                                                                                                   |
| `18`      | `[int]`        | Best Quality Fingers | An unsigned 8-bit number encoding the hand position of the finger. It must be in the range 0-10, where 0 represents "Unknown", 1-5 represents right thumb to little finger, and 6-10 represents left thumb to little finger in sequence |
| `19.. 49` |                | Reserved              | Reserved for future attributes                                                          
|
| `50.. 74` |                | Reserved              | Reserved for Person's Biometrics Data attributes                                        
|
| `50`      | `[Biometrics]` | Right Thumb           | Person's Right Thumb biometrics                                                       
|
| `51`      | `[Biometrics]` | Right Pointer Finger  | Person's Right Pointer Finger biometrics                                                
|
| `52`      | `[Biometrics]` | Right Middle Finger   | Person's Right Middle Finger biometrics                                                 
|
| `53`      | `[Biometrics]` | Right Ring Finger     | Person's Right Ring Finger biometrics                                                   
|
| `54`      | `[Biometrics]` | Right Little Finger   | Person's Right Little Finger biometrics                                                
|
| `55`      | `[Biometrics]` | Left Thumb            | Person's Left Thumb biometrics                                                         
|
| `56`      | `[Biometrics]` | Left Pointer Finger   | Person's Right Pointer Finger biometrics                                               
|
| `57`      | `[Biometrics]` | Left Middle Finger    | Person's Right Middle Finger biometrics                                                 
|
| `58`      | `[Biometrics]` | Left Ring Finger      | Person's Right Ring Finger biometrics                                                   
|
| `59`      | `[Biometrics]` | Left Little Finger    | Person's Right Little Finger biometrics                                                 
|
| `60`      | `[Biometrics]` | Right Iris            | Person's Right Iris biometrics                                                         
|
| `61`      | `[Biometrics]` | Left Iris             | Person's Left Iris biometrics                                                         
|
| `62`      | `[Biometrics]` | Face                  | Person's Face biometrics                                                              
|
| `63`      | `[Biometrics]` | Right Palm Print      | Person's Right Palm Print biometrics                                                   
|
| `64`      | `[Biometrics]` | Left Palm Print       | Person's Left Palm Print biometrics                                                    
|
| `65`      | `[Biometrics]` | Voice                 | Person's Voice biometrics                                                              
|
| `66.. 74` |                | Reserved              | Reserved for future Person's Biometrics Data attributes                                 
|
| `75.. 99` |                | Reserved              | Reserved for future attributes                                                         
|

### `Biometrics`

| Attribute | Type   | Attribute Name                       | Description                                                                                                                                                                                          |
|-----------|--------|--------------------------------------|------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| `0`       | `bstr` | Data                                 | Biometrics binary data                                                                                                                                                                               |
| `1`       | `int`  | [Data format](#data-formats)         | Optional biometrics data format.                                                                                                                                                                     |
| `2`       | `int`  | [Data sub format](#data-sub-formats) | Optional biometrics data sub format.                                                                                                                                                                 |
| `3`       | `tstr` | Data issuer                          | Optional biometric data issuer.                                                                                                                                                                      |

#### Data formats

| Data format | Description |
|-------------|-------------|
| `0`         | Image       |
| `1`         | Template    |
| `2`         | Sound       |
| `3`         | Bio hash    |

##### Data sub formats

###### Image

| Subformat | Description |
|-----------|-------------|
| `0`       | PNG         |
| `1`       | JPEG        |
| `2`       | JPEG2000    |
| `3`       | AVIF        |
| `4`       | WEBP        |
| `5`       | TIFF        |
| `6`       | WSQ         |
| `100..200` | Vendor specific                  |

###### Template

| Subformat  | Description                      |
|------------|----------------------------------|
| `0`        | Fingerprint Template ANSI 378    |
| `1`        | Fingerprint Template ISO 19794-2 |
| `2`        | Fingerprint Template NIST        |
| `100..200` | Vendor specific                  |

###### Sound

| Subformat | Description |
|-----------|-------------|
| `0`       | WAV         |
| `1`       | MP3         |

## CBOR Map Structure Example

```yaml
1: COUN # iss
6: 1665980929 # iat
8: # cnf
  3: dfd1aa976d8d4575a0fe34b96de2bfad # kid
169: # identity-data
  1: "11110000324013" # ID
  2: "1.0" # Version
  3: EN # Language
  4: Peter M Jhon # Full name
  5: Peter # First name
  6: M # Middle name
  7: Jhon # Last name
  8: "19880102" # Date of birth
  9: 1 # Gender: Male
  10: New City, METRO LINE, PA # Address
  11: peter@example.com # Email ID
  12: "+1 234-567" # Phone number
  13: US # Nationality
  14: 2 # Marital status: Married
  15: Jhon Honai # Guardian
  16: 03CBABDF83D068ACB5DE65B3CDF25E0036F2C54(...)E54D23D8EC7DC9BB9F69FD7B7B23383B64F22E25F # Binary image
  17: 2 # Binary image format: JPEG
  18: [1, 2] # Best quality fingers
  50: # Right Thumb Biometrics
    # Right Thumb image
    - 0: 03CBA(...)0378C58 # Data
      1: 0 # Image
      2: 1 # JPEG
    # Right Thumb template
    - 0: 03CBA(...)0378C58 # Data
      1: 1 # Template
      2: 100 # Vendor specific
      3: VendorA # Biometric data issuer
  51: # Right Pointer Finger Biometrics
    # Right Pointer Finger image
    - 0: 36F2C546(...)CB90378C58 # Data
      1: 1 # Image
      2: 6 # WSQ
      3: VendorA # Biometric data issuer
    # Right Pointer Finger template
    - 0: 36F2C546(...)CB90378C58 # Data
      1: 1 # Template
      2: 1 # Fingerprint Template ISO 19794-2
      3: VendorA # Biometric data issuer
  58: # Left Ring Finger Biometrics
    # Left Ring Finger image
    - 0: 36F2C546(...)CB90378C58 # Data
      1: 1 # Image
      2: 6 # WSQ
      3: VendorA # Biometric data issuer   
    # Left Ring Finger template
    - 0: 36F2C546(...)CB90378C58 # Data
      1: 1 # Template
      2: 1 # Fingerprint Template ISO 19794-2
      3: VendorA # Biometric data issuer
   60: # Right Iris Biometrics
    # Right Iris image
    - 0: 36F2C546(...)CB90378C58 # Data
      1: 1 # Image
      2: 6 # WSQ
      3: VendorX # Biometric data issuer
    # Right Iris image 
    - 0: 36F2C546(...)CB90378C58 # Data
      1: 1 # Image
      2: 6 # WSQ
      3: VendorY # Biometric data issuer
   61: # Left Iris Biometrics
    # Left Iris template
    - 0: 36F2C546(...)CB90378C58 # Data
      1: 1 # Template
      2: 100 # Vendor specific
      3: VendorX # Biometric data issuer
    # Left Iris image
    - 0: 36F2C546(...)CB90378C58 # Data
      1: 1 # Template
      2: 100 # Vendor specific
      3: VendorY # Biometric data issuer
   65: # Voice Biometrics   
    # Voice sound
    - 0: 03CBA(...)0378C58 # Data
      1: 2 # Sound
      2: 1 # MP3
    # Voice template
    - 0: 03CBA(...)0378C58 # Data
      1: 1 # Template
      2: 100 # Vendor specific
      3: VendorZ # Biometric data issuer
```

# Conventions and Definitions

{::boilerplate bcp14-tagged}

# Security Considerations

TODO:

1. Current map structure is in plain text and its not the safest way to handle privacy. Adoption of SD-JWT or equivalent can be considered.

2. CWT MUST be signed, create a COSE_Sign/COSE_Sign1 object using the Message as the COSE_Sign/COSE_Sign1 Payload; all steps specified in [RFC8152](https://www.rfc-editor.org/rfc/rfc8152) for creating a COSE_Sign/COSE_Sign1 object MUST be followed.

3. If the CWT is a COSE_Encrypt/COSE_Encrypt0 object,create a COSE_Encrypt/COSE_Encrypt0 using the Message as the plaintext for the COSE_Encrypt/COSE_Encrypt0 object; all steps specified in [RFC8152](https://www.rfc-editor.org/rfc/rfc8152) for creating a COSE_Encrypt/COSE_Encrypt0 object MUST be followed.

4. To verify the claims the CWT is a COSE_Sign/COSE_Sign1, follow the steps specified in Section 4 of [RFC8152](https://www.rfc-editor.org/rfc/rfc8152) ("Signing Objects") for validating a COSE_Sign/COSE_Sign1 object.  Let the Message be the COSE_Sign/COSE_Sign1 payload. Once signature is valid we SHOULD validate the public key against a preconfigured key. In case encrypted Else, if the CWT is a COSE_Encrypt/COSE_Encrypt0 object, follow the steps specified in Section 5 of [RFC8152] ("Encryption Objects") for validating a COSE_Encrypt/COSE_Encrypt0 object.  Let the Message be the resulting plaintext.

The security of the CWT relies upon on the protections offered by COSE.  Unless the claims in a CWT are protected, an adversary can modify, add, or remove claims.

   Since the claims conveyed in a CWT is used to make identity claim decisions, it is not only important to protect the CWT but also to ensure that the recipient can authenticate the party that assembled the claims and created the CWT.  Without trust of the recipient in the party that created the CWT, no sensible
   identity verification can be made.  Furthermore, the creator of the CWT needs to carefully evaluate each claim value prior to including it in the CWT so that the recipient can be assured of the validity of
   the information provided.

   Syntactically, the signing and encryption operations for Nested CWTs may be applied in any order; however, if encryption is necessary, producers normally should sign the message and then encrypt the result (thus encrypting the signature).  This prevents attacks in which the signature is stripped, leaving just an encrypted message, as well as providing privacy for the signer.  Furthermore, signatures over encrypted text are not considered valid in many jurisdictions.

# IANA Considerations

IANA is requested to register the claim 169 in "CBOR Web Token (CWT) Claims" registry [IANA.CWT.Claims](https://www.iana.org/assignments/cwt/cwt.xhtml).

# Acknowledgments

TODO acknowledge.

{backmatter}
