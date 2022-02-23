package dm.webchat.helper;

import java.util.HashMap;
import java.util.Map;

public class ResponseHelper {
    public static Map<String,String> buildSimpleDataResponse(String data) {
        Map<String,String> response = new HashMap<String,String>();
        response.put("data", data);
        return response;
    }
}
