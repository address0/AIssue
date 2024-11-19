package ssafy.aissue.common.exception.s3;

import ssafy.aissue.common.exception.BaseException;
import ssafy.aissue.common.exception.errorcode.S3ErrorCode;

public class ExtensionNotAllowedException extends BaseException {
    public ExtensionNotAllowedException() {
        super(S3ErrorCode.EXTENSION_NOT_ALLOWED);
    }
}
