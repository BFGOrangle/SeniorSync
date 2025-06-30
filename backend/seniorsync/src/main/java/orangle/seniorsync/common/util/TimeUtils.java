package orangle.seniorsync.common.util;

import java.time.OffsetDateTime;
import java.time.ZoneOffset;

public class TimeUtils {
    public static OffsetDateTime getUtcTimeNow() {
        return OffsetDateTime.now(ZoneOffset.UTC);
    }
}
