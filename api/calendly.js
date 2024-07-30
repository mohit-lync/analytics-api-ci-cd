const { default: axios } = require("axios");

const webHook = async () => {
  const personalAccessToken = process.env.PERSONAL_ACCESS_TOKEN;

  try {
    /*
{
  "resource": {
    "avatar_url": null,
    "created_at": "2023-07-07T11:13:36.353610Z",
    "current_organization": "https://api.calendly.com/organizations/9e079d60-e1b6-42fb-abbb-ea8e7b2a5188",
    "email": "shivam@lync.world",
    "name": "Shivam Purohit",
    "timezone": "Asia/Calcutta",
    "updated_at": "2023-07-07T13:14:07.676410Z",
    "uri": "https://api.calendly.com/users/8c839633-368f-47dc-a21f-887561c6f506",
    "resource_type": "User",
    "scheduling_url": "https://calendly.com/shivam-purohit",
    "slug": "shivam-purohit"
  }
}
    */
    var options = {
      method: "POST",
      url: "https://api.calendly.com/webhook_subscriptions",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${personalAccessToken}`,
      },
      data: {
        url: "https://1301-2405-201-5c08-2c1e-2a31-3e1e-a569-a9c8.ngrok-free.app/account-abstraction/insertCallDetails",
        events: ["invitee.created", "invitee.canceled"],
        organization:
          "https://api.calendly.com/organizations/9e079d60-e1b6-42fb-abbb-ea8e7b2a5188",
        user: "https://api.calendly.com/users/8c839633-368f-47dc-a21f-887561c6f506",
        scope: "organization",
        signing_key: "5mEzn9C-I28UtwOjZJtFoob0sAAFZ95GbZkqj4y3i0I",
      },
    };

    const response = await axios.request(options);

    console.log(response.data);

    return response.data;
  } catch (error) {
    console.error("Error retrieving upcoming events from Calendly:");
    throw error;
  }
};
webHook();
