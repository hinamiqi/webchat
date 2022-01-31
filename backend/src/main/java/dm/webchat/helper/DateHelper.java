package dm.webchat.helper;

import java.text.ParseException;
import java.text.SimpleDateFormat;
import java.util.Calendar;
import java.util.Date;

public class DateHelper {
    public static Date getDateWithDelta(Integer deltaMinutes) {
        // try {
        //     SimpleDateFormat format =
        //         new SimpleDateFormat("EEE MMM dd HH:mm:ss zzz yyyy");
        //     return format.parse(new Date() + posDeltaMs);
        // }
        // catch(ParseException pe) {
        //     throw new IllegalArgumentException(pe);
        // }
        Calendar c = Calendar.getInstance();
        c.setTime(new Date());
        c.add(Calendar.MINUTE, deltaMinutes);

        return c.getTime();
    }
}
