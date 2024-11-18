package ssafy.aissue.common.exception.s3;

import ssafy.aissue.common.exception.BaseException;
import ssafy.aissue.common.exception.errorcode.S3ErrorCode;

public class PresignedUrlGenerationFailException extends BaseException {
    public PresignedUrlGenerationFailException() {
        super(S3ErrorCode.PRESIGNEDURL_GENERATION_FAILED);
    }

}
